"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Violin3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const violinRef = useRef<THREE.Group | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffd700, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const backLight = new THREE.DirectionalLight(0x65000b, 0.5);
    backLight.position.set(-5, -5, -5);
    scene.add(backLight);

    // Create violin group
    const violin = createViolin();
    violinRef.current = violin;
    scene.add(violin);

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener("mousemove", onMouseMove);

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      // Smooth rotation following mouse
      targetRotationY = mouseX * 0.5;
      targetRotationX = mouseY * 0.3;

      if (violin) {
        violin.rotation.y += (targetRotationY - violin.rotation.y) * 0.05;
        violin.rotation.x += (targetRotationX - violin.rotation.x) * 0.05;

        // Gentle floating animation
        violin.position.y = Math.sin(Date.now() * 0.001) * 0.1;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[400px]"
      style={{ touchAction: "none" }}
    />
  );
}

function createViolin(): THREE.Group {
  const violin = new THREE.Group();

  // Materials
  const woodMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b4513, // SaddleBrown - wood color
    roughness: 0.4,
    metalness: 0.1,
  });

  const rosewoodMaterial = new THREE.MeshStandardMaterial({
    color: 0x65000b, // Rosewood
    roughness: 0.3,
    metalness: 0.1,
  });

  const goldMaterial = new THREE.MeshStandardMaterial({
    color: 0xd4af37, // Gold
    roughness: 0.2,
    metalness: 0.8,
  });

  const stringMaterial = new THREE.MeshBasicMaterial({
    color: 0xc0c0c0, // Silver strings
  });

  // Body - using ellipsoid shape
  const bodyShape = new THREE.Shape();

  // Create violin body outline using bezier curves
  bodyShape.moveTo(0, -1.2);
  bodyShape.bezierCurveTo(0.6, -1.2, 0.8, -0.8, 0.7, -0.4); // Lower bout right
  bodyShape.bezierCurveTo(0.6, 0, 0.4, 0.1, 0.3, 0); // C-bout right
  bodyShape.bezierCurveTo(0.4, 0.1, 0.6, 0.4, 0.5, 0.8); // Upper bout right
  bodyShape.bezierCurveTo(0.4, 1.1, 0, 1.2, 0, 1.2); // Top
  bodyShape.bezierCurveTo(0, 1.2, -0.4, 1.1, -0.5, 0.8); // Upper bout left
  bodyShape.bezierCurveTo(-0.6, 0.4, -0.4, 0.1, -0.3, 0); // C-bout left
  bodyShape.bezierCurveTo(-0.4, 0.1, -0.6, 0, -0.7, -0.4); // Lower bout left
  bodyShape.bezierCurveTo(-0.8, -0.8, -0.6, -1.2, 0, -1.2); // Bottom

  const bodyGeometry = new THREE.ExtrudeGeometry(bodyShape, {
    depth: 0.15,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 3,
  });

  const body = new THREE.Mesh(bodyGeometry, woodMaterial);
  body.position.z = -0.075;
  violin.add(body);

  // F-holes (simplified as thin boxes)
  const fHoleGeometry = new THREE.BoxGeometry(0.05, 0.4, 0.05);
  const fHoleLeft = new THREE.Mesh(fHoleGeometry, rosewoodMaterial);
  fHoleLeft.position.set(-0.2, 0, 0.1);
  fHoleLeft.rotation.z = 0.2;
  violin.add(fHoleLeft);

  const fHoleRight = new THREE.Mesh(fHoleGeometry, rosewoodMaterial);
  fHoleRight.position.set(0.2, 0, 0.1);
  fHoleRight.rotation.z = -0.2;
  violin.add(fHoleRight);

  // Bridge
  const bridgeGeometry = new THREE.BoxGeometry(0.4, 0.15, 0.03);
  const bridge = new THREE.Mesh(bridgeGeometry, rosewoodMaterial);
  bridge.position.set(0, -0.2, 0.12);
  violin.add(bridge);

  // Tailpiece
  const tailpieceGeometry = new THREE.BoxGeometry(0.15, 0.3, 0.04);
  const tailpiece = new THREE.Mesh(tailpieceGeometry, rosewoodMaterial);
  tailpiece.position.set(0, -0.9, 0.1);
  violin.add(tailpiece);

  // Neck
  const neckGeometry = new THREE.BoxGeometry(0.12, 1.2, 0.08);
  const neck = new THREE.Mesh(neckGeometry, rosewoodMaterial);
  neck.position.set(0, 1.8, 0.04);
  violin.add(neck);

  // Fingerboard
  const fingerboardGeometry = new THREE.BoxGeometry(0.1, 1.0, 0.03);
  const fingerboard = new THREE.Mesh(fingerboardGeometry, rosewoodMaterial);
  fingerboard.position.set(0, 1.7, 0.1);
  violin.add(fingerboard);

  // Scroll (simplified as a spiral-like shape)
  const scrollGeometry = new THREE.TorusGeometry(0.08, 0.03, 8, 16, Math.PI * 1.5);
  const scroll = new THREE.Mesh(scrollGeometry, rosewoodMaterial);
  scroll.position.set(0, 2.5, 0);
  scroll.rotation.y = Math.PI / 2;
  violin.add(scroll);

  // Pegbox
  const pegboxGeometry = new THREE.BoxGeometry(0.15, 0.3, 0.1);
  const pegbox = new THREE.Mesh(pegboxGeometry, rosewoodMaterial);
  pegbox.position.set(0, 2.35, 0);
  violin.add(pegbox);

  // Tuning pegs
  const pegGeometry = new THREE.CylinderGeometry(0.02, 0.015, 0.2, 8);
  for (let i = 0; i < 4; i++) {
    const peg = new THREE.Mesh(pegGeometry, rosewoodMaterial);
    const side = i < 2 ? 1 : -1;
    const yOffset = i % 2 === 0 ? 0.08 : -0.08;
    peg.position.set(side * 0.12, 2.35 + yOffset, 0);
    peg.rotation.z = Math.PI / 2;
    violin.add(peg);
  }

  // Strings
  const stringGeometry = new THREE.CylinderGeometry(0.005, 0.005, 2.8, 4);
  const stringPositions = [-0.03, -0.01, 0.01, 0.03];

  stringPositions.forEach((x) => {
    const string = new THREE.Mesh(stringGeometry, stringMaterial);
    string.position.set(x, 0.8, 0.13);
    violin.add(string);
  });

  // Chin rest
  const chinRestGeometry = new THREE.BoxGeometry(0.2, 0.15, 0.05);
  const chinRest = new THREE.Mesh(chinRestGeometry, rosewoodMaterial);
  chinRest.position.set(-0.35, -0.9, 0.1);
  chinRest.rotation.z = -0.3;
  violin.add(chinRest);

  // Gold accents - fine tuners
  const tunerGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.05, 8);
  for (let i = 0; i < 4; i++) {
    const tuner = new THREE.Mesh(tunerGeometry, goldMaterial);
    tuner.position.set(-0.04 + i * 0.027, -0.85, 0.12);
    violin.add(tuner);
  }

  // Scale and position
  violin.scale.set(1.2, 1.2, 1.2);
  violin.rotation.x = -0.2;

  return violin;
}
