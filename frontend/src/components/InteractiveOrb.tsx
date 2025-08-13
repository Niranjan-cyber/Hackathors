import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const InteractiveOrb: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 700;
    const height = mount.clientHeight || 480;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    // Adjust color space if supported by this three version
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    renderer.outputColorSpace = (THREE as any).SRGBColorSpace || (THREE as any).sRGBEncoding;
    mount.appendChild(renderer.domElement);

    // Smooth premium sphere
    const geometry = new THREE.SphereGeometry(2.25, 128, 128);

    const uniforms = {
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color('#22d3ee') },
      uColorB: { value: new THREE.Color('#7c3aed') },
      uIridescence: { value: 0.35 },
    };

    const vertexShader = `
      // Simplex noise by IQ
      vec3 mod289(vec3 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
      vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
      float snoise(vec3 v){
        const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
        const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );
        vec3 x1 = x0 - i1 + 1.0 * C.xxx;
        vec3 x2 = x0 - i2 + 2.0 * C.xxx;
        vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
        i = mod289(i);
        vec4 p = permute( permute( permute(
                  i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
        float n_ = 0.142857142857; // 1/7
        vec3  ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_ );
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4( x.xy, y.xy );
        vec4 b1 = vec4( x.zw, y.zw );
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
      }

      uniform float uTime;
      varying vec3 vNormal;
      varying vec3 vWorldPos;
      void main(){
        vNormal = normalize(normalMatrix * normal);
        vec3 p = position;
        float n = snoise(normal * 1.5 + vec3(uTime * 0.35));
        float n2 = snoise(position * 0.8 + vec3(uTime * 0.15));
        p += normal * (0.22 * n + 0.12 * n2);
        vec4 worldPos = modelMatrix * vec4(p,1.0);
        vWorldPos = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `;

    const fragmentShader = `
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      uniform float uIridescence;
      varying vec3 vNormal;
      varying vec3 vWorldPos;
      void main(){
        vec3 N = normalize(vNormal);
        vec3 V = normalize(-vWorldPos);
        float fresnel = pow(1.0 - max(dot(N, V), 0.0), 3.0);
        float sheen = smoothstep(0.0, 1.0, fresnel);
        float hue = 0.5 + 0.5 * N.y;
        vec3 grad = mix(uColorA, uColorB, hue);
        vec3 irid = mix(grad, grad.bgr, 0.35 + 0.35 * fresnel) * (0.8 + uIridescence);
        vec3 color = mix(grad, irid, 0.6) + sheen * 0.4;
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Outer additive glow
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `
        varying vec3 vNormal;
        void main(){
          vNormal = normal;
          vec3 p = position + normal * 0.05;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main(){
          float f = pow(1.0 - abs(normalize(vNormal).z), 2.0);
          gl_FragColor = vec4(0.6, 0.9, 1.0, 0.25 * f);
        }
      `,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    const glow = new THREE.Mesh(geometry, glowMaterial);
    glow.scale.setScalar(1.06);
    scene.add(glow);

    // Sparkle ring
    const sparkleCount = 220;
    const positions = new Float32Array(sparkleCount * 3);
    const colors = new Float32Array(sparkleCount * 3);
    for (let i = 0; i < sparkleCount; i++) {
      const angle = (i / sparkleCount) * Math.PI * 2;
      const radius = 3.25 + Math.random() * 0.2;
      positions[i * 3 + 0] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.4;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      colors[i * 3 + 0] = 0.85 + Math.random() * 0.15;
      colors[i * 3 + 1] = 0.9 + Math.random() * 0.1;
      colors[i * 3 + 2] = 1.0;
    }
    const sparkleGeo = new THREE.BufferGeometry();
    sparkleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    sparkleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const sparkleMat = new THREE.PointsMaterial({ size: 0.03, vertexColors: true, transparent: true, opacity: 0.9 });
    const sparkles = new THREE.Points(sparkleGeo, sparkleMat);
    scene.add(sparkles);

    // Lighting
    const key = new THREE.DirectionalLight('#ffffff', 0.35);
    key.position.set(5, 6, 4);
    scene.add(key);

    // Interaction
    const targetRot = { x: -0.25, y: 0.55 };
    const rot = { x: -0.25, y: 0.55 };
    const onMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      const nx = ((e.clientY - rect.top) / rect.height - 0.5) * -1.0;
      const ny = ((e.clientX - rect.left) / rect.width - 0.5) * 1.0;
      targetRot.x = nx;
      targetRot.y = ny;
    };
    window.addEventListener('mousemove', onMove);

    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    const animate = () => {
      const t = clock.getElapsedTime();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (uniforms as any).uTime.value = t;
      rot.x += (targetRot.x - rot.x) * 0.08;
      rot.y += (targetRot.y - rot.y) * 0.08;
      mesh.rotation.x = rot.x;
      mesh.rotation.y = rot.y + t * 0.08; // slow auto spin
      glow.rotation.copy(mesh.rotation);
      sparkles.rotation.y = t * 0.15;
      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
      mount.removeChild(renderer.domElement);
      geometry.dispose();
      (material as THREE.ShaderMaterial).dispose();
      glowMaterial.dispose();
      sparkleGeo.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative mx-auto" style={{ width: 'min(720px, 92vw)', height: 'min(500px, 62vh)' }}>
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
};

export default InteractiveOrb;


