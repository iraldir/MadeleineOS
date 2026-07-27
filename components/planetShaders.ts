import * as THREE from "three";

/**
 * Hand-written materials for the solar system tour. Everything here assumes the
 * Sun sits at the world origin, which lets the shaders work out lighting,
 * shadows and terminators analytically instead of relying on shadow maps.
 */

const WORLD_VERTEX = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;

  void main() {
    vUv = uv;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

/**
 * Earth: day map on the lit side, city lights on the dark side, a specular
 * glint off the oceans, relief from the normal map, and the cloud layer casting
 * a soft shadow on the ground below it.
 */
export function createEarthMaterial(maps: {
  day: THREE.Texture;
  night: THREE.Texture;
  specular: THREE.Texture;
  normal: THREE.Texture;
  clouds: THREE.Texture;
}): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      dayMap: { value: maps.day },
      nightMap: { value: maps.night },
      specularMap: { value: maps.specular },
      normalMap: { value: maps.normal },
      cloudMap: { value: maps.clouds },
      sunPosition: { value: new THREE.Vector3(0, 0, 0) },
      /** How far the cloud layer has drifted ahead of the ground, in turns */
      cloudOffset: { value: 0 },
    },
    vertexShader: WORLD_VERTEX,
    fragmentShader: /* glsl */ `
      uniform sampler2D dayMap;
      uniform sampler2D nightMap;
      uniform sampler2D specularMap;
      uniform sampler2D normalMap;
      uniform sampler2D cloudMap;
      uniform vec3 sunPosition;
      uniform float cloudOffset;

      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldPos;

      void main() {
        vec3 n = normalize(vNormal);
        vec3 sunDir = normalize(sunPosition - vWorldPos);

        // Analytic tangent frame — fine for a sphere with equirectangular UVs.
        vec3 tangent = normalize(cross(vec3(0.0, 1.0, 0.0), n));
        vec3 bitangent = cross(n, tangent);
        vec3 bump = texture2D(normalMap, vUv).xyz * 2.0 - 1.0;
        vec3 surfaceNormal = normalize(tangent * bump.x + bitangent * bump.y + n * bump.z);

        float sunAmount = dot(n, sunDir);
        float daylight = smoothstep(-0.12, 0.22, sunAmount);
        float lambert = max(dot(surfaceNormal, sunDir), 0.0);

        float cloud = texture2D(cloudMap, vec2(vUv.x - cloudOffset, vUv.y)).r;

        vec3 day = texture2D(dayMap, vUv).rgb * (1.0 - cloud * 0.35);
        vec3 color = day * (0.05 + 0.95 * lambert);

        // Sun glinting off the sea
        float ocean = texture2D(specularMap, vUv).r;
        vec3 viewDir = normalize(cameraPosition - vWorldPos);
        vec3 halfDir = normalize(sunDir + viewDir);
        float glint = pow(max(dot(surfaceNormal, halfDir), 0.0), 220.0);
        color += vec3(1.0, 0.96, 0.88) * glint * ocean * daylight * 0.5;

        // City lights, dimmed under cloud cover
        vec3 night = texture2D(nightMap, vUv).rgb;
        color += night * 2.3 * (1.0 - daylight) * (1.0 - cloud * 0.85);

        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
}

/**
 * Uranus' rings are nothing like Saturn's: a few thin, dark, narrow bands.
 * Painted here rather than downloaded, since there is no good public texture.
 */
export function makeThinRingTexture(): THREE.Texture {
  const width = 256;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = 1;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, width, 1);
  // Position (0 = inner edge, 1 = outer), width in pixels, opacity
  const bands: Array<[number, number, number]> = [
    [0.18, 3, 0.18],
    [0.42, 2, 0.13],
    [0.62, 3, 0.2],
    [0.92, 7, 0.5], // the bright epsilon ring on the outside
  ];
  for (const [position, thickness, alpha] of bands) {
    ctx.fillStyle = `rgba(196, 214, 220, ${alpha})`;
    ctx.fillRect(position * width - thickness / 2, 0, thickness, 1);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * The Sun's surface: two copies of the photosphere map drifting across each
 * other so it churns, with limb darkening and a hot rim. Values go well above
 * 1 so the bloom pass has something to catch.
 */
export function createSunMaterial(map: THREE.Texture): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      map: { value: map },
      time: { value: 0 },
    },
    vertexShader: WORLD_VERTEX,
    fragmentShader: /* glsl */ `
      uniform sampler2D map;
      uniform float time;

      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldPos;

      void main() {
        vec3 a = texture2D(map, vUv + vec2(time * 0.0045, 0.0)).rgb;
        vec3 b = texture2D(map, vUv * 1.17 - vec2(time * 0.0031, time * 0.0006)).rgb;
        vec3 surface = mix(a, b, 0.45);

        vec3 viewDir = normalize(cameraPosition - vWorldPos);
        float mu = max(dot(normalize(vNormal), viewDir), 0.0);
        float limb = 0.5 + 0.5 * pow(mu, 0.5);

        vec3 color = surface * limb * 1.65;
        color += vec3(1.0, 0.42, 0.06) * pow(1.0 - mu, 3.0) * 0.9;

        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
}

/**
 * A lit planet that also catches the shadow its rings cast across it — the
 * dark band Saturn wears in every real photograph. Found by tracing the ray
 * from each surface point towards the Sun and seeing where it crosses the
 * ring plane.
 */
export function createRingShadowedPlanetMaterial(
  map: THREE.Texture,
  ringMap: THREE.Texture,
  ringInner: number,
  ringOuter: number
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      map: { value: map },
      ringMap: { value: ringMap },
      ringInner: { value: ringInner },
      ringOuter: { value: ringOuter },
      ringNormal: { value: new THREE.Vector3(0, 1, 0) },
      planetCenter: { value: new THREE.Vector3() },
      sunPosition: { value: new THREE.Vector3(0, 0, 0) },
    },
    vertexShader: WORLD_VERTEX,
    fragmentShader: /* glsl */ `
      uniform sampler2D map;
      uniform sampler2D ringMap;
      uniform float ringInner;
      uniform float ringOuter;
      uniform vec3 ringNormal;
      uniform vec3 planetCenter;
      uniform vec3 sunPosition;

      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldPos;

      void main() {
        vec3 n = normalize(vNormal);
        vec3 sunDir = normalize(sunPosition - vWorldPos);
        float lambert = max(dot(n, sunDir), 0.0);

        float shade = 0.0;
        float facing = dot(ringNormal, sunDir);
        if (abs(facing) > 0.001) {
          float t = dot(planetCenter - vWorldPos, ringNormal) / facing;
          if (t > 0.0) {
            vec3 hit = vWorldPos + sunDir * t;
            float radius = length(hit - planetCenter);
            float u = (radius - ringInner) / (ringOuter - ringInner);
            if (u >= 0.0 && u <= 1.0) {
              shade = texture2D(ringMap, vec2(u, 0.5)).a * 0.85;
            }
          }
        }

        vec3 color = texture2D(map, vUv).rgb * (0.06 + 0.94 * lambert) * (1.0 - shade);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
}

/**
 * Saturn's rings, with the planet's shadow falling across them. The shadow is
 * solved analytically: a ring point is dark when the planet sits between it and
 * the Sun.
 */
export function createRingMaterial(map: THREE.Texture): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      map: { value: map },
      sunPosition: { value: new THREE.Vector3(0, 0, 0) },
      planetCenter: { value: new THREE.Vector3() },
      planetRadius: { value: 1 },
    },
    vertexShader: WORLD_VERTEX,
    fragmentShader: /* glsl */ `
      uniform sampler2D map;
      uniform vec3 sunPosition;
      uniform vec3 planetCenter;
      uniform float planetRadius;

      varying vec2 vUv;
      varying vec3 vWorldPos;

      void main() {
        vec4 texel = texture2D(map, vec2(vUv.x, 0.5));

        vec3 toSun = normalize(sunPosition - vWorldPos);
        vec3 toPlanet = planetCenter - vWorldPos;
        float along = dot(toPlanet, toSun);
        float miss = length(toPlanet - along * toSun);
        float shadow = along > 0.0
          ? smoothstep(planetRadius * 1.05, planetRadius * 0.92, miss)
          : 0.0;

        gl_FragColor = vec4(texel.rgb * 1.15 * mix(1.0, 0.16, shadow), texel.a);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
}
