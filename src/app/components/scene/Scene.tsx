"use client";

import { Canvas,useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useEffect, useRef,useState } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRM, VRMLoaderPlugin } from "@pixiv/three-vrm";
import { PerspectiveCamera } from "three";

// Simple resize handler that ignores keyboard events
function AdaptiveResizeHandler() {
  const { camera, gl, size } = useThree();
  const lastRealSize = useRef({ width: size.width, height: size.height });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      const widthDiff = Math.abs(width - lastRealSize.current.width);
      const heightDiff = Math.abs(height - lastRealSize.current.height);
      
      // If this looks like a keyboard event (significant height change only), ignore it
      const isLikelyKeyboard = heightDiff > 100 && heightDiff < 500 && widthDiff < 10;
      
      if (!isLikelyKeyboard) {
        // Actual window resize - update Three.js
        // Type-safe camera aspect update
        if (camera instanceof PerspectiveCamera) {
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        }
        gl.setSize(width, height, false);
        lastRealSize.current = { width, height };
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [camera, gl]);

  return null;
}

// Alternative approach using type guard (even safer)
function SafeResizeHandler() {
  const { camera, gl } = useThree();
  const lastRealSize = useRef({ 
    width: window.innerWidth, 
    height: window.innerHeight 
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      const widthDiff = Math.abs(width - lastRealSize.current.width);
      const heightDiff = Math.abs(height - lastRealSize.current.height);
      
      // Check if this is likely a keyboard event
      const isLikelyKeyboard = heightDiff > 100 && heightDiff < 500 && widthDiff < 10;
      
      if (!isLikelyKeyboard) {
        // Type guard for PerspectiveCamera
        if ('aspect' in camera) {
          (camera as PerspectiveCamera).aspect = width / height;
          camera.updateProjectionMatrix();
        }
        
        gl.setSize(width, height, false);
        lastRealSize.current = { width, height };
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [camera, gl]);

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
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 1.6, 2.6], fov: 45 }} // This creates a PerspectiveCamera
        onCreated={({ gl, size }) => {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          gl.setSize(size.width, size.height, false);
        }}
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh'
        }}
      >
        <color attach="background" args={["#e0e0e0"]} />
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[1, 3, 4]} intensity={1.2} />
          <Avatar />
          <Floor />
          <SafeResizeHandler /> {/* Use the safe version */}
        </Suspense>
        <OrbitControls 
          target={[0, 1.0, 0]}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
        />
      </Canvas>
    </div>
  );
}
