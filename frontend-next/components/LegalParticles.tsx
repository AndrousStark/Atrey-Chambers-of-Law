'use client';

import { useMemo, useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Cylinder, Box, Sphere, Torus, Text } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion-3d';

const HIGH_PARTICLE_COUNT = 12000;
const MED_PARTICLE_COUNT = 6000;
const LOW_PARTICLE_COUNT = 2000;

function getDeviceTier(): 'high' | 'medium' | 'low' {
    if (typeof window === 'undefined') return 'medium';
    const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const cores = navigator.hardwareConcurrency || 2;
    const memoryGB = (navigator as { deviceMemory?: number }).deviceMemory || 4;
    if (isMobile || cores <= 2 || memoryGB <= 2) return 'low';
    if (cores <= 4 || memoryGB <= 4) return 'medium';
    return 'high';
}

function getParticleCount(tier: 'high' | 'medium' | 'low'): number {
    if (tier === 'high') return HIGH_PARTICLE_COUNT;
    if (tier === 'medium') return MED_PARTICLE_COUNT;
    return LOW_PARTICLE_COUNT;
}

// --- Solid Objects (Enhanced Materials) ---
const Scales = ({ visible }: { visible: boolean }) => {
    return (
        <motion.group
            animate={{ scale: visible ? 1 : 0, opacity: visible ? 1 : 0 }}
            transition={{ duration: 0.8, ease: "backOut" }}
            visible={visible}
        >
            <Cylinder args={[0.1, 0.15, 6, 32]} position={[0, 0, 0]} castShadow receiveShadow>
                <meshPhysicalMaterial color="#FFEB3B" metalness={0.7} roughness={0.1} clearcoat={1} clearcoatRoughness={0.05} emissive="#FFEB3B" emissiveIntensity={0.2} />
            </Cylinder>
            <Cylinder args={[1.5, 1.8, 0.5, 32]} position={[0, -3.2, 0]} castShadow receiveShadow>
                <meshPhysicalMaterial color="#FFEB3B" metalness={0.7} roughness={0.15} clearcoat={0.9} emissive="#FFEB3B" emissiveIntensity={0.15} />
            </Cylinder>
            <Cylinder args={[0.1, 0.1, 5, 32]} position={[0, 3, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
                <meshPhysicalMaterial color="#FFEB3B" metalness={0.7} roughness={0.1} clearcoat={1} emissive="#FFEB3B" emissiveIntensity={0.2} />
            </Cylinder>
            <group position={[-2.5, 1.5, 0]}>
                <Torus args={[1, 0.05, 16, 32]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
                    <meshPhysicalMaterial color="#FFEB3B" metalness={0.7} roughness={0.1} clearcoat={1} emissive="#FFEB3B" emissiveIntensity={0.2} />
                </Torus>
                <Sphere args={[1, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} rotation={[Math.PI, 0, 0]} position={[0, -0.5, 0]} castShadow receiveShadow>
                    <meshPhysicalMaterial color="#FFEB3B" metalness={0.7} roughness={0.1} side={THREE.DoubleSide} clearcoat={1} emissive="#FFEB3B" emissiveIntensity={0.2} />
                </Sphere>
                <Cylinder args={[0.02, 0.02, 2, 8]} position={[0, 1, 0]} castShadow receiveShadow>
                    <meshStandardMaterial color="#E0E0E0" metalness={0.8} roughness={0.2} />
                </Cylinder>
            </group>
            <group position={[2.5, 1.5, 0]}>
                <Torus args={[1, 0.05, 16, 32]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
                    <meshPhysicalMaterial color="#FFEB3B" metalness={0.7} roughness={0.1} clearcoat={1} emissive="#FFEB3B" emissiveIntensity={0.2} />
                </Torus>
                <Sphere args={[1, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} rotation={[Math.PI, 0, 0]} position={[0, -0.5, 0]} castShadow receiveShadow>
                    <meshPhysicalMaterial color="#FFEB3B" metalness={0.7} roughness={0.1} side={THREE.DoubleSide} clearcoat={1} emissive="#FFEB3B" emissiveIntensity={0.2} />
                </Sphere>
                <Cylinder args={[0.02, 0.02, 2, 8]} position={[0, 1, 0]} castShadow receiveShadow>
                    <meshStandardMaterial color="#E0E0E0" metalness={0.8} roughness={0.2} />
                </Cylinder>
            </group>
        </motion.group>
    );
};

const Gavel = ({ visible }: { visible: boolean }) => {
    return (
        <motion.group
            animate={{
                scale: visible ? 1 : 0,
                rotateZ: visible ? -Math.PI / 4 : 0,
                rotateX: visible ? 0.2 : 0
            }}
            transition={{ duration: 0.8, ease: "backOut" }}
            visible={visible}
        >
            <Cylinder args={[0.15, 0.2, 4, 32]} position={[0, -1, 0]} castShadow receiveShadow>
                <meshPhysicalMaterial color="#D4A574" roughness={0.4} clearcoat={0.3} />
            </Cylinder>
            <group position={[0, 1.2, 0]} rotation={[0, 0, Math.PI / 2]}>
                <Cylinder args={[0.6, 0.6, 2.5, 32]} castShadow receiveShadow>
                    <meshPhysicalMaterial color="#D4A574" roughness={0.4} clearcoat={0.3} />
                </Cylinder>
                <Cylinder args={[0.62, 0.62, 0.2, 32]} position={[0, 1, 0]} castShadow receiveShadow>
                    <meshPhysicalMaterial color="#FFD700" metalness={0.95} roughness={0.15} clearcoat={1} />
                </Cylinder>
                <Cylinder args={[0.62, 0.62, 0.2, 32]} position={[0, -1, 0]} castShadow receiveShadow>
                    <meshPhysicalMaterial color="#FFD700" metalness={0.95} roughness={0.15} clearcoat={1} />
                </Cylinder>
            </group>
            <Cylinder args={[1.5, 1.8, 0.5, 6]} position={[0, -3.5, 0]} castShadow receiveShadow>
                <meshPhysicalMaterial color="#C9A882" roughness={0.5} />
            </Cylinder>
        </motion.group>
    );
};

const Book = ({ visible }: { visible: boolean }) => {
    return (
        <motion.group
            animate={{ scale: visible ? 1 : 0, rotateY: visible ? -0.5 : 0 }}
            transition={{ duration: 0.8, ease: "backOut" }}
            visible={visible}
        >
            <Box args={[3.5, 4.5, 0.8]} position={[0, 0, 0]} castShadow receiveShadow>
                <meshPhysicalMaterial color="#64B5F6" roughness={0.3} clearcoat={0.6} />
            </Box>
            <Box args={[3.3, 4.3, 0.7]} position={[0.1, 0, 0]} castShadow receiveShadow>
                <meshStandardMaterial color="#FAFAFA" roughness={0.4} />
            </Box>
            <Box args={[0.2, 4.5, 0.85]} position={[-1.7, 0, 0]} castShadow receiveShadow>
                <meshPhysicalMaterial color="#FFD700" metalness={0.9} roughness={0.2} clearcoat={0.8} />
            </Box>
            <Text
                position={[0, 1, 0.41]}
                fontSize={0.4}
                color="gold"
            // font="/fonts/Geist-Bold.ttf" // Removed to fix 404
            >
                LAW
            </Text>
        </motion.group>
    );
};

const Globe = ({ visible }: { visible: boolean }) => {
    return (
        <motion.group
            animate={{ scale: visible ? 1 : 0 }}
            transition={{ duration: 0.8, ease: "backOut" }}
            visible={visible}
        >
            <Sphere args={[2.5, 64, 64]} castShadow receiveShadow>
                <meshPhysicalMaterial
                    color="#4FC3F7"
                    metalness={0.2}
                    roughness={0.2}
                    transmission={0.15}
                    thickness={1.5}
                />
            </Sphere>
            <Sphere args={[2.55, 32, 32]} castShadow receiveShadow>
                <meshPhysicalMaterial
                    color="#66BB6A"
                    transparent
                    opacity={0.4}
                    roughness={0.7}
                    wireframe
                />
            </Sphere>
            <Torus args={[3.2, 0.1, 16, 64]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
                <meshPhysicalMaterial color="#FFD700" metalness={0.95} roughness={0.15} clearcoat={1} />
            </Torus>
        </motion.group>
    );
};

// --- Particles Logic ---
const generateShape = (type: 'scales' | 'gavel' | 'book' | 'globe', count: number) => {
    const points = [];
    for (let i = 0; i < count; i++) {
        let x = 0, y = 0, z = 0;
        if (type === 'scales') {
            x = (Math.random() - 0.5) * 6; y = (Math.random() - 0.5) * 6; z = (Math.random() - 0.5) * 2;
        } else if (type === 'gavel') {
            x = (Math.random() - 0.5) * 4; y = (Math.random() - 0.5) * 4; z = (Math.random() - 0.5) * 2;
        } else if (type === 'book') {
            x = (Math.random() - 0.5) * 4; y = (Math.random() - 0.5) * 5; z = (Math.random() - 0.5) * 1;
        } else {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const rad = 2.5;
            x = rad * Math.sin(phi) * Math.cos(theta);
            y = rad * Math.sin(phi) * Math.sin(theta);
            z = rad * Math.cos(phi);
        }
        points.push(new THREE.Vector3(x, y, z));
    }
    return points;
};

const Particles = ({ activeSection, targetPosition, isScrolling, backgroundColor, particleCount }: { activeSection: number, targetPosition: [number, number, number], isScrolling: boolean, backgroundColor: string, particleCount: number }) => {
    const mesh = useRef<THREE.InstancedMesh>(null);
    const { clock } = useThree();
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const shapes = useMemo(() => [
        generateShape('book', particleCount),
        generateShape('scales', particleCount),
        generateShape('gavel', particleCount),
        generateShape('globe', particleCount)
    ], [particleCount]);

    const particles = useMemo(() => {
        return new Array(particleCount).fill(0).map(() => ({
            position: new THREE.Vector3((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10),
        }));
    }, [particleCount]);

    useFrame(() => {
        if (!mesh.current) return;
        const targetShape = shapes[activeSection % shapes.length];
        const time = clock.getElapsedTime();

        particles.forEach((particle, i) => {
            const target = targetShape[i];
            const finalTargetX = target.x + targetPosition[0];
            const finalTargetY = target.y + targetPosition[1];
            const finalTargetZ = target.z + targetPosition[2];

            const dx = finalTargetX - particle.position.x;
            const dy = finalTargetY - particle.position.y;
            const dz = finalTargetZ - particle.position.z;

            // Enhanced Swirl Physics
            const force = isScrolling ? 0.08 : 0.04; // Faster when scrolling
            const swirl = isScrolling ? 0.02 : 0.005; // More swirl when scrolling

            particle.position.x += dx * force - (particle.position.z * swirl);
            particle.position.z += dz * force + (particle.position.x * swirl);
            particle.position.y += dy * force;

            // Add noise/turbulence
            const noise = Math.sin(time * 2 + particle.position.x * 0.5) * 0.05;
            particle.position.y += noise;

            dummy.position.copy(particle.position);
            dummy.scale.setScalar(0.02);
            dummy.updateMatrix();
            mesh.current!.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    const targetOpacity = isScrolling ? 0.15 : 0.08; // Very translucent particles

    // Convert background color to a slightly darker shade for particles
    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 239, g: 235, b: 221 };
    };
    
    const rgb = hexToRgb(backgroundColor);
    // Make it slightly darker for contrast
    const particleColor = `rgb(${Math.max(0, rgb.r - 20)}, ${Math.max(0, rgb.g - 20)}, ${Math.max(0, rgb.b - 20)})`;

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, particleCount]} position={[0, 0, -2]}>
            <sphereGeometry args={[1, 4, 4]} />
            <motion.meshStandardMaterial
                color={particleColor}
                transparent
                animate={{ opacity: targetOpacity }}
                transition={{ duration: 0.5 }}
            />
        </instancedMesh>
    );
};

export const LegalParticles = ({ activeSection, backgroundColor }: { activeSection: number, backgroundColor: string }) => {
    const isRight = activeSection % 2 === 0;
    const position: [number, number, number] = isRight ? [2.5, 0, 0] : [-2.5, 0, 0];

    const [isScrolling, setIsScrolling] = useState(false);
    const [deviceTier, setDeviceTier] = useState<'high' | 'medium' | 'low'>('medium');
    const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setDeviceTier(getDeviceTier());
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolling(true);
            if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
            scrollTimeout.current = setTimeout(() => {
                setIsScrolling(false);
            }, 300);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const particleCount = getParticleCount(deviceTier);
    const dpr: [number, number] = deviceTier === 'low' ? [1, 1] : [1, 2];
    const shadowMapSize = deviceTier === 'low' ? 512 : 2048;

    return (
        <div className="w-full h-full absolute inset-0 pointer-events-none">
            <Suspense fallback={null}>
                <Canvas dpr={dpr} camera={{ position: [0, 2, 12], fov: 45 }} shadows={deviceTier !== 'low'}>
                    <ambientLight intensity={0.6} />
                    <directionalLight position={[5, 8, 5]} intensity={3} castShadow={deviceTier !== 'low'} shadow-mapSize-width={shadowMapSize} shadow-mapSize-height={shadowMapSize} />
                    <directionalLight position={[-5, 5, -5]} intensity={2} color="#FFEB3B" />
                    <pointLight position={[8, 8, 8]} intensity={3} />
                    {deviceTier !== 'low' && (
                        <>
                            <pointLight position={[-8, 3, -8]} color="#FFEB3B" intensity={2.5} />
                            <pointLight position={[0, 6, 6]} color="#FFFFFF" intensity={2} />
                            <spotLight position={[0, 12, 0]} intensity={3.5} angle={0.6} penumbra={0.5} castShadow />
                        </>
                    )}

                    {deviceTier !== 'low' && (
                        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]} receiveShadow>
                            <planeGeometry args={[20, 20]} />
                            <meshStandardMaterial color="#F5F5F5" opacity={0.1} transparent />
                        </mesh>
                    )}

                    <Particles activeSection={activeSection} targetPosition={position} isScrolling={isScrolling} backgroundColor={backgroundColor} particleCount={particleCount} />

                    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                        <group position={[position[0], position[1], activeSection === 1 ? 0.5 : 0]} scale={0.6}>
                            <Book visible={activeSection === 0 && !isScrolling} />
                            <group position={[0, 0, 0]} renderOrder={activeSection === 1 ? 1 : 0}>
                                <Scales visible={activeSection === 1 && !isScrolling} />
                            </group>
                            <Gavel visible={activeSection === 2 && !isScrolling} />
                            <Globe visible={activeSection === 3 && !isScrolling} />
                        </group>
                    </Float>
                </Canvas>
            </Suspense>
        </div>
    );
};
