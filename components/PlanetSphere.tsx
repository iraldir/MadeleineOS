"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  createRingMaterial,
  createSunMaterial,
  makeThinRingTexture,
} from "./planetShaders";
import { Planet, SUN } from "@/types/planets";

interface PlanetSphereProps {
  planet: Planet;
  /** Rendered size in CSS pixels (square) */
  size?: number;
}

/** Where the light comes from. The shaders take a position, not a direction. */
const LIGHT_POSITION = new THREE.Vector3(25, 15, 30);

/**
 * A single planet, textured and slowly spinning — used by the quiz so the
 * child sees the same 3D bodies as in the solar system tour.
 */
export default function PlanetSphere({ planet, size = 320 }: PlanetSphereProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(size, size);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);

    const isSun = planet.id === SUN.id;
    // Fill the frame, leaving a little margin. Rings need extra room, but not
    // their full span or the planet itself ends up tiny.
    const reach = planet.ring ? planet.ring.outer * 0.72 : 1;
    camera.position.set(0, 0.18, (reach * 1.25) / Math.tan(Math.PI / 9));
    camera.lookAt(0, 0, 0);

    const loader = new THREE.TextureLoader();
    const map = loader.load(planet.texture);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const geometry = new THREE.SphereGeometry(1, 128, 80);
    const sunMaterial = isSun ? createSunMaterial(map) : null;
    const material =
      sunMaterial ??
      new THREE.MeshStandardMaterial({ map, roughness: 0.92, metalness: 0 });

    const spinner = new THREE.Group();
    spinner.rotation.z = (planet.tilt * Math.PI) / 180;
    // Start on a random face so the child recognises the planet, not the picture.
    spinner.rotation.y = Math.random() * Math.PI * 2;
    scene.add(spinner);
    spinner.add(new THREE.Mesh(geometry, material));

    const extra: Array<{ dispose: () => void }> = [map, geometry, material];

    if (planet.ring) {
      const ringMap = planet.ring.faint
        ? makeThinRingTexture()
        : loader.load("/textures/planets/saturn_ring.webp");
      ringMap.colorSpace = THREE.SRGBColorSpace;
      const ringGeometry = new THREE.RingGeometry(
        planet.ring.inner,
        planet.ring.outer,
        128,
        1
      );
      const position = ringGeometry.attributes.position;
      const uv = ringGeometry.attributes.uv;
      const point = new THREE.Vector3();
      for (let i = 0; i < position.count; i++) {
        point.fromBufferAttribute(position, i);
        const t =
          (point.length() - planet.ring.inner) /
          (planet.ring.outer - planet.ring.inner);
        uv.setXY(i, t, 0.5);
      }
      uv.needsUpdate = true;
      const ringMaterial = createRingMaterial(ringMap);
      ringMaterial.uniforms.sunPosition.value.copy(LIGHT_POSITION);
      ringMaterial.uniforms.planetRadius.value = 1;
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = -Math.PI / 2;
      spinner.add(ring);
      extra.push(ringMap, ringGeometry, ringMaterial);
    }

    if (!isSun) {
      scene.add(new THREE.AmbientLight(0xffffff, 0.55));
      const key = new THREE.DirectionalLight(0xfff4e0, 3);
      key.position.copy(LIGHT_POSITION);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0x7f9dff, 0.6);
      rim.position.set(-3, 0.5, -1);
      scene.add(rim);
    }

    // No post-processing here on purpose: a bloom pass would force the canvas
    // opaque and paint a black box over the page. The glow around the planet is
    // done in CSS instead.
    const clock = new THREE.Clock();
    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.1);
      // Always a comfortable, watchable spin — direction stays true to life.
      spinner.rotation.y += dt * 0.35 * Math.sign(planet.spinSeconds);
      if (sunMaterial) sunMaterial.uniforms.time.value = clock.getElapsedTime();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      extra.forEach((item) => item.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [planet, size]);

  return <div ref={containerRef} style={{ width: size, height: size }} />;
}
