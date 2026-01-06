import React, { useRef, useEffect } from 'react';

const Background = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width = window.innerWidth;
        let height = window.innerHeight;
        let particles = [];

        // Configuration
        const particleCount = 60; // Number of particles
        const connectionDistance = 150; // Distance to connect particles
        const mouseDistance = 200; // Distance to connect to mouse

        // Colors corresponding to theme
        const particleColor = 'rgba(0, 0, 0, 0.5)'; // Black particles
        const lineColor = 'rgba(0, 0, 0, 0.2)'; // Black lines

        // Mouse state
        const mouse = { x: null, y: null };

        // Resize handler
        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            initParticles();
        };

        // Mouse move handler
        const handleMouseMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        const handleMouseLeave = () => {
            mouse.x = null;
            mouse.y = null;
        }

        // Particle Class
        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5; // Slow velocity
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 15 + 10; // Larger squares (10-25px)
                this.angle = Math.random() * 360; // Initial rotation
                this.spin = (Math.random() - 0.5) * 0.02; // Slow rotation speed
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.angle += this.spin; // Rotate

                // Wall collision (bounce)
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle);
                ctx.strokeStyle = particleColor;
                ctx.lineWidth = 2; // Thick outline
                ctx.strokeRect(-this.size / 2, -this.size / 2, this.size, this.size);
                ctx.restore();
            }
        }

        const initParticles = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            // Update and draw particles
            particles.forEach((particle, index) => {
                particle.update();
                particle.draw();

                // Connect to mouse & Repulsion
                if (mouse.x != null) {
                    const dx = mouse.x - particle.x;
                    const dy = mouse.y - particle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < mouseDistance) {
                        ctx.beginPath();
                        ctx.strokeStyle = lineColor;
                        ctx.lineWidth = 2; // Bold line
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();

                        // Repulsion Effect
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const maxDistance = mouseDistance;
                        const force = (maxDistance - distance) / maxDistance;
                        const directionX = forceDirectionX * force * 5; // Strength
                        const directionY = forceDirectionY * force * 5;

                        particle.x -= directionX;
                        particle.y -= directionY;
                    }
                }

                // Connect to other particles (optional, for 'constellation')
                for (let j = index + 1; j < particles.length; j++) {
                    const dx = particles[j].x - particle.x;
                    const dy = particles[j].y - particle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        ctx.beginPath();
                        ctx.strokeStyle = lineColor;
                        ctx.lineWidth = 1; // Thicker than before
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            });

            requestAnimationFrame(animate);
        };

        // Setup
        handleResize();
        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseout', handleMouseLeave);
        animate();

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseout', handleMouseLeave);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                background: 'transparent', // Let CSS body background show through
                pointerEvents: 'none' // Don't block clicks
            }}
        />
    );
};

export default Background;
