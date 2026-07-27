"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import {
  createEarthMaterial,
  makeThinRingTexture,
  createRingMaterial,
  createRingShadowedPlanetMaterial,
  createSunMaterial,
} from "./planetShaders";
import Link from "next/link";
import { Howl } from "howler";
import { ArrowLeft, Volume2 } from "lucide-react";
import { PLANETS, SUN, Planet, planetAudioUrl } from "@/types/planets";
import styles from "./SolarSystem3D.module.css";

const BODIES: Planet[] = [SUN, ...PLANETS];

/** The direction the camera looks from when nothing is selected — a wide, slightly tilted view. */
const HOME_DIRECTION = new THREE.Vector3(0, 70, 198).normalize();
const HOME_TARGET = new THREE.Vector3(0, 0, 0);
/** Neptune's orbit — the overview is framed so this just spans the screen. */
const SYSTEM_RADIUS = 107;
const FLIGHT_SECONDS = 1.6;

const deg = (d: number) => (d * Math.PI) / 180;
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** One body as it exists in the scene. */
interface Body {
  planet: Planet;
  /** Rotates around the Sun */
  orbit: THREE.Group;
  /** Sits at the orbit radius — the body's own position */
  holder: THREE.Group;
  /** Spins on its (tilted) axis */
  spinner: THREE.Object3D;
  clouds?: THREE.Mesh;
  moonOrbit?: THREE.Group;
}

/** Soft radial glow used for the Sun's corona. */
function makeGlowTexture(): THREE.Texture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  gradient.addColorStop(0, "rgba(255, 236, 160, 0.45)");
  gradient.addColorStop(0.25, "rgba(255, 176, 46, 0.22)");
  gradient.addColorStop(0.55, "rgba(255, 120, 20, 0.07)");
  gradient.addColorStop(1, "rgba(255, 90, 0, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Saturn's ring texture is a horizontal strip, so the ring's UVs have to be
 * remapped from the default (angular) layout to a radial one.
 */
function radialRingGeometry(inner: number, outer: number): THREE.RingGeometry {
  const geometry = new THREE.RingGeometry(inner, outer, 128, 1);
  const position = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  const point = new THREE.Vector3();
  for (let i = 0; i < position.count; i++) {
    point.fromBufferAttribute(position, i);
    const t = (point.length() - inner) / (outer - inner);
    uv.setXY(i, t, 0.5);
  }
  uv.needsUpdate = true;
  return geometry;
}

export default function SolarSystem3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState<Planet | null>(null);
  const [loaded, setLoaded] = useState(false);
  /** Set by the scene each time it is built, so React buttons can drive the camera. */
  const flyToRef = useRef<(id: string | null) => void>(() => {});
  const voicesRef = useRef<Map<string, Howl>>(new Map());

  const speak = useCallback((id: string) => {
    let voice = voicesRef.current.get(id);
    if (!voice) {
      voice = new Howl({ src: [planetAudioUrl(id)], volume: 1 });
      voicesRef.current.set(id, voice);
    }
    voice.play();
  }, []);

  const select = useCallback(
    (planet: Planet | null) => {
      flyToRef.current(planet?.id ?? null);
      setFocused(planet);
      if (planet) speak(planet.id);
    },
    [speak]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      2000
    );

    /**
     * Pull back far enough that Neptune's orbit fits on screen. The system is
     * a flat disc seen at a shallow angle and perspective throws its near edge
     * a long way down the frame, so rather than trying to derive the distance,
     * we project the outer orbit and zoom out until it fits.
     */
    const homePosition = new THREE.Vector3();
    const outerOrbit: THREE.Vector3[] = [];
    for (let i = 0; i < 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      outerOrbit.push(
        new THREE.Vector3(
          Math.cos(a) * SYSTEM_RADIUS,
          0,
          Math.sin(a) * SYSTEM_RADIUS
        )
      );
    }
    const probe = new THREE.Vector3();
    /** How far the outer orbit reaches across the frame, in NDC, from `distance`. */
    const extentAt = (distance: number) => {
      camera.position.copy(HOME_DIRECTION).multiplyScalar(distance);
      camera.lookAt(HOME_TARGET);
      camera.updateMatrixWorld();
      let extent = 0;
      for (const point of outerOrbit) {
        probe.copy(point).project(camera);
        // Width only: the disc is fitted across the screen, and the near edge
        // of the outer two orbits is allowed to run off the bottom.
        extent = Math.max(extent, Math.abs(probe.x));
      }
      return extent;
    };

    const fitHome = () => {
      const savedPosition = camera.position.clone();
      const savedQuaternion = camera.quaternion.clone();

      // The extent shrinks monotonically as we pull back, but not linearly —
      // perspective blows up whatever is nearest — so bisect rather than
      // trying to step towards the answer.
      let near = SYSTEM_RADIUS * 1.3;
      let far = SYSTEM_RADIUS * 10;
      for (let i = 0; i < 24; i++) {
        const middle = (near + far) / 2;
        if (extentAt(middle) > 0.99) near = middle;
        else far = middle;
      }
      homePosition.copy(HOME_DIRECTION).multiplyScalar(far);

      camera.position.copy(savedPosition);
      camera.quaternion.copy(savedQuaternion);
      camera.updateMatrixWorld();
    };

    fitHome();
    camera.position.copy(homePosition);
    camera.lookAt(HOME_TARGET);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 1.2;
    controls.maxDistance = homePosition.length() * 1.25;
    controls.target.copy(HOME_TARGET);

    const manager = new THREE.LoadingManager();
    manager.onLoad = () => setLoaded(true);
    const loader = new THREE.TextureLoader(manager);
    const load = (url: string) => {
      const texture = loader.load(url);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      return texture;
    };
    /** Normal / specular maps hold data, not colour — they must stay linear. */
    const loadData = (url: string) => {
      const texture = loader.load(url);
      texture.colorSpace = THREE.NoColorSpace;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      return texture;
    };

    // Deep space
    const stars = load("/textures/planets/stars.webp");
    stars.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = stars;
    scene.backgroundIntensity = 0.45;

    scene.add(new THREE.AmbientLight(0xffffff, 0.16));
    // decay 0 keeps Neptune as readable as Mercury — physically wrong, but this
    // is a picture book, not an observatory.
    const sunLight = new THREE.PointLight(0xfff4e0, 2.6, 0, 0);
    scene.add(sunLight);

    const disposables: Array<{ dispose: () => void }> = [stars];
    const sphere = new THREE.SphereGeometry(1, 160, 96);
    disposables.push(sphere);

    /** Materials that need a fresh value every frame. */
    const sunMaterials: THREE.ShaderMaterial[] = [];
    /** Ring surfaces and the ringed planet — both need the planet's position,
     *  and the planet also needs to know which way the ring plane faces. */
    const ringed: Array<{
      material: THREE.ShaderMaterial;
      holder: THREE.Object3D;
      spinner?: THREE.Object3D;
    }> = [];
    let earthMaterial: THREE.ShaderMaterial | undefined;

    const pickable: THREE.Object3D[] = [];
    const bodies: Body[] = [];
    const orbitLines: THREE.LineBasicMaterial[] = [];

    BODIES.forEach((planet, index) => {
      const orbit = new THREE.Group();
      // Golden-angle offsets spread the planets around the Sun instead of
      // lining them all up on one side.
      orbit.rotation.y = index * 2.399;
      scene.add(orbit);

      const holder = new THREE.Group();
      holder.position.x = planet.orbitRadius;
      orbit.add(holder);

      const spinner = new THREE.Group();
      spinner.rotation.z = deg(planet.tilt);
      holder.add(spinner);

      const map = load(planet.texture);
      disposables.push(map);
      const isSun = planet.id === SUN.id;

      let material: THREE.Material;
      let earthClouds: THREE.Texture | undefined;
      let ringTexture: THREE.Texture | undefined;
      if (isSun) {
        const sunMaterial = createSunMaterial(map);
        sunMaterials.push(sunMaterial);
        material = sunMaterial;
      } else if (planet.id === "earth") {
        // Earth is worth the extra maps: city lights, sea glint and relief.
        const night = load("/textures/planets/earth_night.webp");
        const specular = loadData("/textures/planets/earth_specular.webp");
        const normal = loadData("/textures/planets/earth_normal.webp");
        earthClouds = load("/textures/planets/earth_clouds.webp");
        disposables.push(night, specular, normal, earthClouds);
        earthMaterial = createEarthMaterial({
          day: map,
          night,
          specular,
          normal,
          clouds: earthClouds,
        });
        material = earthMaterial;
      } else if (planet.ring) {
        ringTexture = planet.ring.faint
          ? makeThinRingTexture()
          : load("/textures/planets/saturn_ring.webp");
        disposables.push(ringTexture);
        const saturnMaterial = createRingShadowedPlanetMaterial(
          map,
          ringTexture,
          planet.radius * planet.ring.inner,
          planet.radius * planet.ring.outer
        );
        ringed.push({ material: saturnMaterial, holder, spinner });
        material = saturnMaterial;
      } else {
        material = new THREE.MeshStandardMaterial({
          map,
          roughness: 0.92,
          metalness: 0,
        });
      }
      disposables.push(material);

      const mesh = new THREE.Mesh(sphere, material);
      mesh.scale.setScalar(planet.radius);
      spinner.add(mesh);

      if (isSun) {
        const glowTexture = makeGlowTexture();
        const glowMaterial = new THREE.SpriteMaterial({
          map: glowTexture,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          transparent: true,
        });
        disposables.push(glowTexture, glowMaterial);
        const glow = new THREE.Sprite(glowMaterial);
        glow.scale.setScalar(planet.radius * 3.8);
        holder.add(glow);
      }

      let clouds: THREE.Mesh | undefined;
      if (earthClouds) {
        const cloudMaterial = new THREE.MeshStandardMaterial({
          alphaMap: earthClouds,
          transparent: true,
          opacity: 0.85,
          depthWrite: false,
          roughness: 1,
        });
        disposables.push(cloudMaterial);
        clouds = new THREE.Mesh(sphere, cloudMaterial);
        clouds.scale.setScalar(planet.radius * 1.015);
        spinner.add(clouds);
      }

      if (planet.ring && ringTexture) {
        const ringGeometry = radialRingGeometry(
          planet.radius * planet.ring.inner,
          planet.radius * planet.ring.outer
        );
        const ringMaterial = createRingMaterial(ringTexture);
        ringMaterial.uniforms.planetRadius.value = planet.radius;
        ringed.push({ material: ringMaterial, holder });
        disposables.push(ringGeometry, ringMaterial);
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = -Math.PI / 2;
        spinner.add(ring);
      }

      let moonOrbit: THREE.Group | undefined;
      if (planet.moon) {
        moonOrbit = new THREE.Group();
        const moonMap = load("/textures/planets/moon.webp");
        const moonMaterial = new THREE.MeshStandardMaterial({
          map: moonMap,
          roughness: 1,
        });
        disposables.push(moonMap, moonMaterial);
        const moon = new THREE.Mesh(sphere, moonMaterial);
        moon.scale.setScalar(planet.moon.radius);
        moon.position.x = planet.moon.distance;
        moonOrbit.add(moon);
        moonOrbit.rotation.x = deg(12);
        holder.add(moonOrbit);
      }

      // Orbit line
      if (planet.orbitRadius > 0) {
        const points: THREE.Vector3[] = [];
        for (let i = 0; i <= 256; i++) {
          const a = (i / 256) * Math.PI * 2;
          points.push(
            new THREE.Vector3(
              Math.cos(a) * planet.orbitRadius,
              0,
              Math.sin(a) * planet.orbitRadius
            )
          );
        }
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const lineMaterial = new THREE.LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.22,
        });
        disposables.push(lineGeometry, lineMaterial);
        orbitLines.push(lineMaterial);
        scene.add(new THREE.LineLoop(lineGeometry, lineMaterial));
      }

      // Invisible, generously sized hit sphere so small planets are easy to tap.
      const hitMaterial = new THREE.MeshBasicMaterial({
        colorWrite: false,
        depthWrite: false,
        transparent: true,
        opacity: 0,
      });
      disposables.push(hitMaterial);
      const hit = new THREE.Mesh(sphere, hitMaterial);
      hit.scale.setScalar(Math.max(planet.radius * 1.5, 2.4));
      hit.userData.planetId = planet.id;
      holder.add(hit);
      pickable.push(hit);

      bodies.push({
        planet,
        orbit,
        holder,
        spinner,
        clouds,
        moonOrbit,
      });
    });

    // ---- camera flight -------------------------------------------------
    let focusedId: string | null = null;
    let flight: {
      elapsed: number;
      fromPosition: THREE.Vector3;
      fromTarget: THREE.Vector3;
      toId: string | null;
    } | null = null;

    const worldPosition = new THREE.Vector3();
    const offset = new THREE.Vector3();
    const desired = new THREE.Vector3();

    const bodyOf = (id: string) => bodies.find((b) => b.planet.id === id)!;

    /**
     * Points that have to stay on screen when we visit a body: its silhouette,
     * plus the outer edge of its rings if it has any.
     */
    const sampleSpace: THREE.Vector3[] = Array.from(
      { length: 72 },
      () => new THREE.Vector3()
    );
    const ringBasisU = new THREE.Vector3();
    const ringBasisV = new THREE.Vector3();
    const ringNormal = new THREE.Vector3();
    const fitQuaternion = new THREE.Quaternion();

    const samplesFor = (body: Body, centre: THREE.Vector3, view: THREE.Vector3) => {
      const { planet } = body;
      const samples: THREE.Vector3[] = [];
      // The silhouette: a circle of the planet's radius facing the camera
      ringBasisU.set(0, 1, 0).cross(view).normalize();
      ringBasisV.copy(view).cross(ringBasisU).normalize();
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        const point = sampleSpace[samples.length];
        point
          .copy(centre)
          .addScaledVector(ringBasisU, Math.cos(a) * planet.radius)
          .addScaledVector(ringBasisV, Math.sin(a) * planet.radius);
        samples.push(point);
      }
      if (planet.ring) {
        // The ring's outer edge, in the planet's own equatorial plane
        body.spinner.getWorldQuaternion(fitQuaternion);
        ringNormal.set(0, 1, 0).applyQuaternion(fitQuaternion).normalize();
        ringBasisU.set(1, 0, 0).cross(ringNormal);
        if (ringBasisU.lengthSq() < 1e-6) ringBasisU.set(0, 0, 1).cross(ringNormal);
        ringBasisU.normalize();
        ringBasisV.copy(ringNormal).cross(ringBasisU).normalize();
        const reach = planet.radius * planet.ring.outer;
        for (let i = 0; i < 48; i++) {
          const a = (i / 48) * Math.PI * 2;
          const point = sampleSpace[samples.length];
          point
            .copy(centre)
            .addScaledVector(ringBasisU, Math.cos(a) * reach)
            .addScaledVector(ringBasisV, Math.sin(a) * reach);
          samples.push(point);
        }
      }
      return samples;
    };

    /** How far from a body the camera should sit, and from which side. */
    const viewFor = (body: Body, out: THREE.Vector3) => {
      const { planet } = body;
      body.holder.getWorldPosition(worldPosition);

      if (worldPosition.lengthSq() < 1e-6) {
        // The Sun: no "sunward" side, just pull back and up a little.
        offset.set(0, 0.32, 1).normalize();
      } else {
        // A three-quarter view: mostly on the sunlit side, but far enough
        // round that the terminator — and Earth's city lights — show.
        const sunward = worldPosition.clone().normalize().negate();
        const sideways = new THREE.Vector3(0, 1, 0).cross(sunward).normalize();
        // A planet with flat rings needs the camera well above their plane or
        // they collapse into a line. Uranus' rings are already edge-on to the
        // ecliptic, so it keeps the normal viewpoint.
        const elevation = planet.ring && planet.tilt < 60 ? 0.85 : 0.3;
        offset
          .copy(sunward)
          .multiplyScalar(0.6)
          .addScaledVector(sideways, 0.88)
          .add(new THREE.Vector3(0, elevation, 0))
          .normalize();
      }

      // Come in as close as the body allows: near enough that it owns the
      // screen, far enough that rings still fit. Measured by projection,
      // because perspective magnifies whichever edge is closest to us.
      const samples = samplesFor(body, worldPosition, offset);
      // A bare planet may fill the frame; rings get a little breathing room.
      const target = planet.ring ? 0.94 : 0.86;
      const savedPosition = camera.position.clone();
      const savedQuaternion = camera.quaternion.clone();

      let near = planet.radius * 1.4;
      let far = planet.radius * 40;
      for (let i = 0; i < 20; i++) {
        const middle = (near + far) / 2;
        camera.position.copy(worldPosition).addScaledVector(offset, middle);
        camera.lookAt(worldPosition);
        camera.updateMatrixWorld();
        let extent = 0;
        for (const point of samples) {
          probe.copy(point).project(camera);
          extent = Math.max(extent, Math.abs(probe.x), Math.abs(probe.y));
        }
        if (extent > target) near = middle;
        else far = middle;
      }

      camera.position.copy(savedPosition);
      camera.quaternion.copy(savedQuaternion);
      camera.updateMatrixWorld();

      out.copy(worldPosition).addScaledVector(offset, far);
    };

    flyToRef.current = (id: string | null) => {
      flight = {
        elapsed: 0,
        fromPosition: camera.position.clone(),
        fromTarget: controls.target.clone(),
        toId: id,
      };
      focusedId = id;
      controls.enabled = false;
      // Once we are visiting a planet, everything else gets out of the way —
      // only that planet and the Sun are left in the sky.
      bodies.forEach((b) => {
        b.holder.visible =
          id === null || b.planet.id === id || b.planet.id === SUN.id;
      });
    };

    // ---- picking -------------------------------------------------------
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const visiblePickable = () =>
      pickable.filter((hit) => hit.parent?.visible !== false);
    let pressX = 0;
    let pressY = 0;

    const onPointerDown = (event: PointerEvent) => {
      pressX = event.clientX;
      pressY = event.clientY;
    };

    const onPointerUp = (event: PointerEvent) => {
      const moved = Math.hypot(event.clientX - pressX, event.clientY - pressY);
      if (moved > 8) return; // a drag, not a tap

      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      // A hidden planet must not be clickable through the empty space it left.
      const hits = raycaster.intersectObjects(visiblePickable(), false);
      if (hits.length > 0) {
        const id = hits[0].object.userData.planetId as string;
        const planet = BODIES.find((p) => p.id === id) ?? null;
        select(planet);
      } else if (focusedId) {
        select(null);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      renderer.domElement.style.cursor =
        raycaster.intersectObjects(visiblePickable(), false).length > 0
          ? "pointer"
          : "grab";
    };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointermove", onPointerMove);

    // ---- post-processing -----------------------------------------------
    // A half-float target keeps the Sun's over-bright pixels intact so the
    // bloom pass has something to bleed; 4x MSAA replaces the antialiasing
    // that is lost as soon as we render through a composer.
    const renderTarget = new THREE.WebGLRenderTarget(
      container.clientWidth,
      container.clientHeight,
      { type: THREE.HalfFloatType, samples: 4 }
    );
    const composer = new EffectComposer(renderer, renderTarget);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(container.clientWidth, container.clientHeight),
      0.45, // strength
      0.45, // radius
      0.85 // threshold — only the Sun itself is bright enough to bleed
    );
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    // ---- loop ----------------------------------------------------------
    const clock = new THREE.Clock();
    const spinTilt = new THREE.Quaternion();
    let frame = 0;

    const animate = () => {
      frame = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.1);

      bodies.forEach((body) => {
        const { planet } = body;
        if (planet.orbitSeconds > 0) {
          body.orbit.rotation.y += (Math.PI * 2 * dt) / planet.orbitSeconds;
        }
        body.spinner.rotation.y += (Math.PI * 2 * dt) / planet.spinSeconds;
        if (body.clouds) body.clouds.rotation.y += dt * 0.012;
        if (body.moonOrbit && planet.moon) {
          body.moonOrbit.rotation.y += (Math.PI * 2 * dt) / planet.moon.orbitSeconds;
        }
      });

      // Shader uniforms that change with the scene
      const elapsed = clock.getElapsedTime();
      sunMaterials.forEach((material) => {
        material.uniforms.time.value = elapsed;
      });
      if (earthMaterial) {
        const drift = bodies.find((b) => b.planet.id === "earth")?.clouds?.rotation.y ?? 0;
        // Tell the ground shader where the clouds are, so their shadow lands
        // in the right place.
        earthMaterial.uniforms.cloudOffset.value = drift / (Math.PI * 2);
      }
      ringed.forEach(({ material, holder, spinner }) => {
        holder.getWorldPosition(material.uniforms.planetCenter.value);
        if (spinner) {
          // The ring plane is the planet's equator, which tips as it orbits.
          material.uniforms.ringNormal.value
            .set(0, 1, 0)
            .applyQuaternion(spinner.getWorldQuaternion(spinTilt))
            .normalize();
        }
      });

      if (flight) {
        flight.elapsed += dt;
        const t = Math.min(flight.elapsed / FLIGHT_SECONDS, 1);
        const e = easeInOut(t);
        if (flight.toId) {
          const body = bodyOf(flight.toId);
          viewFor(body, desired);
          camera.position.lerpVectors(flight.fromPosition, desired, e);
          controls.target.lerpVectors(flight.fromTarget, worldPosition, e);
        } else {
          camera.position.lerpVectors(flight.fromPosition, homePosition, e);
          controls.target.lerpVectors(flight.fromTarget, HOME_TARGET, e);
        }
        if (t >= 1) {
          flight = null;
          controls.enabled = true;
        }
      } else if (focusedId) {
        // Follow the planet along its orbit while leaving the user free to
        // rotate and zoom around it.
        const body = bodyOf(focusedId);
        body.holder.getWorldPosition(worldPosition);
        offset.copy(camera.position).sub(controls.target);
        controls.target.copy(worldPosition);
        camera.position.copy(worldPosition).add(offset);
      }

      controls.update();

      // The orbit lines are guides for the wide view — they only get in the
      // way once we are up close to a planet.
      const wantedOpacity = focusedId ? 0 : 0.22;
      orbitLines.forEach((material) => {
        material.opacity += (wantedOpacity - material.opacity) * Math.min(dt * 3, 1);
      });

      composer.render();
    };
    animate();

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      if (!clientWidth || !clientHeight) return;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
      composer.setSize(clientWidth, clientHeight);
      bloom.setSize(clientWidth, clientHeight);
      fitHome();
      controls.maxDistance = homePosition.length() * 1.25;
      // Re-frame the overview for the new shape of the window.
      if (!focusedId && !flight) camera.position.copy(homePosition);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      controls.dispose();
      composer.dispose();
      renderTarget.dispose();
      disposables.forEach((item) => item.dispose());
      renderer.dispose();
      renderer.domElement.remove();
      flyToRef.current = () => {};
    };
  }, [select]);

  return (
    <div className={styles.wrapper}>
      {/* The app's usual back button doubles as "leave this planet": while a
          planet is selected it flies back out, and only then does it go home. */}
      <nav className={styles.nav}>
        {focused ? (
          <button
            className={styles.backButton}
            onClick={() => select(null)}
            aria-label="Back to the solar system"
          >
            <ArrowLeft size={32} />
          </button>
        ) : (
          <Link href="/" className={styles.backButton} aria-label="Back to games">
            <ArrowLeft size={32} />
          </Link>
        )}
      </nav>

      {focused ? (
        <button
          key={focused.id}
          className={styles.planetName}
          onClick={() => speak(focused.id)}
          style={{ ["--accent" as string]: focused.color }}
        >
          {focused.name}
          <Volume2 className={styles.speaker} size={34} />
        </button>
      ) : (
        <h1 className={styles.title}>The Solar System</h1>
      )}

      <div className={styles.stage}>
        <div ref={containerRef} className={styles.canvas} />
        {!loaded && (
          <div className={styles.loading}>
            <div className={styles.loadingOrb} />
            <p>Warming up the Sun…</p>
          </div>
        )}
      </div>

      <nav className={styles.strip}>
        {BODIES.map((planet) => (
          <button
            key={planet.id}
            className={`${styles.card} ${
              focused?.id === planet.id ? styles.cardActive : ""
            }`}
            onClick={() => select(planet)}
            style={{ ["--accent" as string]: planet.color }}
          >
            <img
              src={`/images/planets/${planet.id}.webp`}
              alt=""
              className={styles.cardArt}
              draggable={false}
            />
            <span className={styles.cardName}>{planet.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
