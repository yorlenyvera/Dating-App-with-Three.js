"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useEffect, useState } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRM, VRMLoaderPlugin } from "@pixiv/three-vrm";

// Add this component to handle proper resizing
function ResizeHandler() {
  const { camera, gl } = useThree();
  const [lastRealHeight, setLastRealHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightDiff = Math.abs(currentHeight - lastRealHeight);
      
      // Only update Three.js on real window resizes, not keyboard events
      if (heightDiff > 100 && heightDiff < 300) {
        // This is likely a keyboard event - ignore it
        return;
      }
      
      // This is a real resize - update Three.js
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      gl.setSize(window.innerWidth, window.innerHeight);
      setLastRealHeight(currentHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [camera, gl, lastRealHeight]);

  return null;
}

function Avatar() {
  const [vrm, setVrm] = useState<VRM | null>(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    
    loader.loadAsync("/assets/base_avatar.vrm").then((gltf) => {
      setVrm(gltf.userData.vrm);
    });
  }, []);

  useFrame((_, delta) => {
    vrm?.update(delta);
  });

  if (!vrm) return null;
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

export default function Scene() {
  return (
    <div className="fixed inset-0">
      <Canvas
        className="w-full h-full block"
        camera={{ position: [0, 1.6, 2.6], fov: 45 }}
        onCreated={({ gl }) => {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }}
        // Important: Disable automatic resize handling
        style={{ position: 'fixed' }}
      >
        <color attach="background" args={["#e0e0e0"]} />
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[1, 3, 4]} intensity={1.2} />
          <Avatar />
          <Floor />
          <ResizeHandler />
        </Suspense>
        <OrbitControls target={[0, 1.0, 0]} />
      </Canvas>
    </div>
  );
}


/*
"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useEffect, useState } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRM, VRMLoaderPlugin } from "@pixiv/three-vrm";

function Avatar() {
  const [vrm, setVrm] = useState<VRM | null>(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    
    loader.loadAsync("/assets/base_avatar.vrm").then((gltf) => {
      setVrm(gltf.userData.vrm);
    });
  }, []);

  useFrame((_, delta) => {
    vrm?.update(delta);
  });

  if (!vrm) return null;
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

export default function Scene() {
  return (
    <div className="fixed inset-0">
      <Canvas
        className="w-full h-full block"
        camera={{ position: [0, 1.6, 2.6], fov: 45 }}
        onCreated={({ gl }) => {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }}
      >
        <color attach="background" args={["#e0e0e0"]} />
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[1, 3, 4]} intensity={1.2} />
          <Avatar />
          <Floor />
        </Suspense>
        <OrbitControls target={[0, 1.0, 0]} />
      </Canvas>
    </div>
  );
}

*/