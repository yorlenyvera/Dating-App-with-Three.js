"use client";

import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useEffect, useState, useRef } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRM, VRMLoaderPlugin } from "@pixiv/three-vrm";
import * as THREE from "three";

// NO RESIZE HANDLER - Scene stays completely static
function StaticScene() {
  const { camera, gl } = useThree();
  const initialized = useRef(false);

  useEffect(() => {
    // Initial setup only - ignore ALL resize events
    if (!initialized.current) {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
      
      gl.setSize(width, height, false);
      initialized.current = true;
    }

    // NO EVENT LISTENERS - Scene never responds to resize
  }, [camera, gl]);

  return null;
}

function Avatar() {
  const [vrm, setVrm] = useState<VRM | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    
    loader.load(
      "/assets/base_avatar.vrm",
      (gltf) => {
        const vrm = gltf.userData.vrm as VRM;
        if (vrm) {
          vrm.scene.rotation.y = Math.PI;
          setVrm(vrm);
        }
        setLoading(false);
      },
      undefined,
      (error) => {
        console.error('Failed to load VRM:', error);
        setLoading(false);
      }
    );
  }, []);

  const { useFrame } = require('@react-three/fiber');
  useFrame((_, delta) => {
    vrm?.update(delta);
  });

  if (loading) {
    return (
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshBasicMaterial color="#666666" />
      </mesh>
    );
  }

  if (!vrm) {
    return (
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshBasicMaterial color="#ff4444" />
      </mesh>
    );
  }

  return <primitive object={vrm.scene} />;
}

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#90ee90" />
    </mesh>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[3, 5, 5]} 
        intensity={1.2} 
        castShadow
      />
    </>
  );
}

export default function Scene() {
  return (
    <div 
      className="fixed inset-0 z-0"
      style={{
        // CRITICAL: Ensure no transforms can affect this container
        transform: 'none !important',
        position: 'fixed !important',
        top: '0 !important',
        left: '0 !important',
        width: '100vw !important',
        height: '100vh !important'
      }}
    >
      <Canvas
        camera={{ 
          position: [0, 1.6, 3], 
          fov: 45,
          near: 0.1,
          far: 1000
        }}
        onCreated={({ gl }) => {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'block',
          // CRITICAL: No transforms
          transform: 'none !important'
        }}
        // Disable automatic resize handling
        frameloop="demand"
      >
        <color attach="background" args={["#e0e0e0"]} />
        <Suspense fallback={null}>
          <Lights />
          <Avatar />
          <Floor />
          <StaticScene />
        </Suspense>
        
        <OrbitControls 
          target={[0, 1.0, 0]}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={1}
          maxDistance={10}
        />
      </Canvas>
    </div>
  );
}