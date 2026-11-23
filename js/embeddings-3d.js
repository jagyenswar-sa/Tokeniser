/**
 * LLM Token Explorer - 3D Vector Embedding Space Visualizer
 * Renders high-dimensional semantic word embeddings projected into 3D.
 * Supports interactive rotation, zoom, panning, semantic clusters, nearest-neighbor
 * constellation lines, and dynamic single-token injection with animated camera focus.
 */

export const INITIAL_EMBEDDINGS = [
  // AI & Tech (Cluster: ai, Hue: Violet/Indigo)
  { token: 'token', cluster: 'ai', x: 120, y: 80, z: -40, color: '#818cf8' },
  { token: 'model', cluster: 'ai', x: 140, y: 110, z: -20, color: '#818cf8' },
  { token: 'neural', cluster: 'ai', x: 90, y: 130, z: -60, color: '#818cf8' },
  { token: 'transformer', cluster: 'ai', x: 160, y: 90, z: -80, color: '#818cf8' },
  { token: 'attention', cluster: 'ai', x: 110, y: 150, z: -50, color: '#818cf8' },
  { token: 'vector', cluster: 'ai', x: 130, y: 50, z: -70, color: '#818cf8' },
  { token: 'weights', cluster: 'ai', x: 80, y: 90, z: -30, color: '#818cf8' },
  { token: 'gpu', cluster: 'ai', x: 170, y: 130, z: -30, color: '#818cf8' },

  // Nature & Cosmos (Cluster: cosmos, Hue: Emerald/Teal)
  { token: 'galaxy', cluster: 'cosmos', x: -130, y: 100, z: 90, color: '#34d399' },
  { token: 'star', cluster: 'cosmos', x: -160, y: 80, z: 120, color: '#34d399' },
  { token: 'nebula', cluster: 'cosmos', x: -110, y: 130, z: 70, color: '#34d399' },
  { token: 'planet', cluster: 'cosmos', x: -140, y: 60, z: 140, color: '#34d399' },
  { token: 'ocean', cluster: 'cosmos', x: -90, y: -40, z: 110, color: '#2dd4bf' },
  { token: 'forest', cluster: 'cosmos', x: -120, y: -80, z: 80, color: '#2dd4bf' },
  { token: 'mountain', cluster: 'cosmos', x: -150, y: -60, z: 130, color: '#2dd4bf' },

  // Animals & Life (Cluster: animals, Hue: Amber/Orange)
  { token: 'fox', cluster: 'animals', x: 110, y: -120, z: 80, color: '#fbbf24' },
  { token: 'wolf', cluster: 'animals', x: 140, y: -100, z: 110, color: '#fbbf24' },
  { token: 'falcon', cluster: 'animals', x: 80, y: -150, z: 60, color: '#fb923c' },
  { token: 'eagle', cluster: 'animals', x: 60, y: -130, z: 90, color: '#fb923c' },
  { token: 'lion', cluster: 'animals', x: 150, y: -140, z: 70, color: '#fbbf24' },
  { token: 'dolphin', cluster: 'animals', x: 120, y: -70, z: 130, color: '#f59e0b' },
  { token: 'tiger', cluster: 'animals', x: 160, y: -110, z: 50, color: '#fbbf24' },

  // Actions & Verbs (Cluster: actions, Hue: Sky/Cyan)
  { token: 'explore', cluster: 'actions', x: -60, y: -120, z: -110, color: '#38bdf8' },
  { token: 'predict', cluster: 'actions', x: -30, y: -90, z: -140, color: '#38bdf8' },
  { token: 'generate', cluster: 'actions', x: -80, y: -140, z: -90, color: '#38bdf8' },
  { token: 'learn', cluster: 'actions', x: -40, y: -70, z: -120, color: '#38bdf8' },
  { token: 'compute', cluster: 'actions', x: 10, y: -100, z: -130, color: '#38bdf8' },
  { token: 'create', cluster: 'actions', x: -90, y: -110, z: -70, color: '#38bdf8' },

  // Abstract & Mind (Cluster: abstract, Hue: Rose/Pink)
  { token: 'curiosity', cluster: 'abstract', x: -40, y: 140, z: -80, color: '#f43f5e' },
  { token: 'harmony', cluster: 'abstract', x: 0, y: 160, z: -50, color: '#f43f5e' },
  { token: 'intelligence', cluster: 'abstract', x: 40, y: 130, z: -70, color: '#fb7185' },
  { token: 'dream', cluster: 'abstract', x: -60, y: 110, z: -110, color: '#f43f5e' },
  { token: 'future', cluster: 'abstract', x: 20, y: 170, z: -90, color: '#fb7185' }
];

export const CLUSTER_CONFIG = {
  ai: { label: 'AI & Computing', color: '#818cf8', center: [130, 90, -50] },
  cosmos: { label: 'Nature & Cosmos', color: '#34d399', center: [-130, 60, 100] },
  animals: { label: 'Animals & Life', color: '#fbbf24', center: [120, -120, 80] },
  actions: { label: 'Actions & Verbs', color: '#38bdf8', center: [-50, -100, -110] },
  abstract: { label: 'Abstract & Mind', color: '#f43f5e', center: [-10, 140, -80] },
  custom: { label: 'User Added', color: '#ec4899', center: [0, 0, 0] }
};

export class EmbeddingVisualizer3D {
  constructor(canvasContainer, options = {}) {
    this.container = canvasContainer;
    this.nodes = JSON.parse(JSON.stringify(INITIAL_EMBEDDINGS));
    this.filteredCluster = 'all';
    this.selectedNode = null;
    this.hoveredNode = null;
    this.showLines = true;
    this.autoRotate = true;

    // Camera angles
    this.rotX = 0.35;
    this.rotY = -0.55;
    this.zoom = 1.0;
    this.targetZoom = 1.0;
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    // Focus target animation
    this.focusTarget = null;
    this.newlyAddedToken = null;
    this.beaconPulse = 0;

    this.onSelectNode = options.onSelectNode || null;

    this.initCanvas();
    this.setupEvents();
    this.startLoop();
  }

  initCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'w-full h-full block cursor-grab active:cursor-grabbing select-none';
    this.container.innerHTML = '';
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.resize();
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width || 800;
    this.height = rect.height || 500;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  setupEvents() {
    window.addEventListener('resize', () => this.resize());

    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      this.autoRotate = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const dx = e.clientX - this.lastMouseX;
        const dy = e.clientY - this.lastMouseY;
        this.rotY += dx * 0.006;
        this.rotX += dy * 0.006;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
      } else {
        this.handleHover(e);
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      this.zoom = Math.max(0.4, Math.min(2.5, this.zoom * delta));
    }, { passive: false });

    this.canvas.addEventListener('click', (e) => {
      const node = this.getNodeAtScreen(e.clientX, e.clientY);
      if (node) {
        this.selectNode(node);
      }
    });
  }

  handleHover(e) {
    const node = this.getNodeAtScreen(e.clientX, e.clientY);
    if (node !== this.hoveredNode) {
      this.hoveredNode = node;
      this.canvas.style.cursor = node ? 'pointer' : (this.isDragging ? 'grabbing' : 'grab');
    }
  }

  getNodeAtScreen(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const mx = clientX - rect.left;
    const my = clientY - rect.top;

    const projected = this.getProjectedNodes();
    // Search in reverse order (closest first)
    for (let i = projected.length - 1; i >= 0; i--) {
      const p = projected[i];
      const dist = Math.hypot(p.sx - mx, p.sy - my);
      if (dist <= p.radius + 6) {
        return p.node;
      }
    }
    return null;
  }

  selectNode(node) {
    this.selectedNode = node;
    if (this.onSelectNode) {
      const neighbors = this.findNearestNeighbors(node, 4);
      this.onSelectNode(node, neighbors);
    }
  }

  /**
   * Adds a single custom token to the 3D embedding space!
   * Automatically calculates 3D coordinates, spawns with a beacon burst,
   * animates camera rotation to center the token, and draws neighbor lines.
   */
  addToken(tokenStr, cluster = 'custom') {
    if (!tokenStr || !tokenStr.trim()) return null;
    const clean = tokenStr.trim();

    // Check if already exists
    const existing = this.nodes.find(n => n.token.toLowerCase() === clean.toLowerCase());
    if (existing) {
      this.focusOnNode(existing);
      this.selectNode(existing);
      return existing;
    }

    // Determine cluster center
    const clusterCfg = CLUSTER_CONFIG[cluster] || CLUSTER_CONFIG.custom;
    const [cx, cy, cz] = clusterCfg.center;

    // Deterministic jitter based on token string hash
    let hash = 0;
    for (let i = 0; i < clean.length; i++) {
      hash = (hash << 5) - hash + clean.charCodeAt(i);
      hash |= 0;
    }
    const jx = ((Math.abs(hash) % 70) - 35);
    const jy = ((Math.abs(hash * 3) % 70) - 35);
    const jz = ((Math.abs(hash * 7) % 70) - 35);

    const newNode = {
      token: clean,
      cluster: cluster,
      x: cx + jx,
      y: cy + jy,
      z: cz + jz,
      color: clusterCfg.color,
      isUserAdded: true,
      birthTime: Date.now()
    };

    this.nodes.push(newNode);
    this.newlyAddedToken = newNode;
    this.beaconPulse = 1.0;

    this.focusOnNode(newNode);
    this.selectNode(newNode);
    return newNode;
  }

  focusOnNode(node) {
    // Calculate rotation angles to face the node
    const angleY = -Math.atan2(node.x, node.z);
    const distXZ = Math.hypot(node.x, node.z);
    const angleX = Math.atan2(node.y, distXZ);

    this.targetRotY = angleY;
    this.targetRotX = angleX;
    this.animatingCamera = true;
  }

  findNearestNeighbors(targetNode, count = 3) {
    const dists = this.nodes
      .filter(n => n !== targetNode)
      .map(n => {
        const dx = n.x - targetNode.x;
        const dy = n.y - targetNode.y;
        const dz = n.z - targetNode.z;
        const dist = Math.hypot(dx, dy, dz);
        // Cosine similarity approximation
        const maxDist = 350;
        const similarity = Math.max(0.1, +(1.0 - (dist / maxDist)).toFixed(3));
        return { node: n, dist, similarity };
      });

    dists.sort((a, b) => a.dist - b.dist);
    return dists.slice(0, count);
  }

  getProjectedNodes() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const fov = 400 * this.zoom;

    // Rotation matrices
    const cosY = Math.cos(this.rotY);
    const sinY = Math.sin(this.rotY);
    const cosX = Math.cos(this.rotX);
    const sinX = Math.sin(this.rotX);

    const visibleNodes = this.nodes.filter(n => {
      if (this.filteredCluster === 'all') return true;
      return n.cluster === this.filteredCluster;
    });

    const projected = [];

    for (const node of visibleNodes) {
      // 1. Rotate around Y
      let x1 = node.x * cosY + node.z * sinY;
      let y1 = node.y;
      let z1 = -node.x * sinY + node.z * cosY;

      // 2. Rotate around X
      let x2 = x1;
      let y2 = y1 * cosX - z1 * sinX;
      let z2 = y1 * sinX + z1 * cosX;

      // Distance offset from camera
      const cameraZ = 380;
      const zDepth = z2 + cameraZ;

      if (zDepth > 20) {
        const scale = fov / zDepth;
        const sx = cx + x2 * scale;
        const sy = cy - y2 * scale;
        const baseRadius = node.isUserAdded ? 7.5 : 5.5;
        const radius = Math.max(2.5, baseRadius * scale * 0.7);

        projected.push({
          node,
          sx,
          sy,
          zDepth,
          scale,
          radius
        });
      }
    }

    // Sort by depth so distant nodes are drawn first
    projected.sort((a, b) => b.zDepth - a.zDepth);
    return projected;
  }

  startLoop() {
    const render = () => {
      this.update();
      this.draw();
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  update() {
    if (this.autoRotate) {
      this.rotY += 0.002;
    }

    // Camera glide animation
    if (this.animatingCamera) {
      this.rotY += (this.targetRotY - this.rotY) * 0.08;
      this.rotX += (this.targetRotX - this.rotX) * 0.08;
      if (Math.abs(this.targetRotY - this.rotY) < 0.01 && Math.abs(this.targetRotX - this.rotX) < 0.01) {
        this.animatingCamera = false;
      }
    }

    // Beacon pulse decay
    if (this.beaconPulse > 0) {
      this.beaconPulse = Math.max(0, this.beaconPulse - 0.008);
    }
  }

  draw() {
    const ctx = this.ctx;
    const isDark = document.documentElement.classList.contains('dark');

    // Clear canvas
    ctx.clearRect(0, 0, this.width, this.height);

    // Subtle 3D Depth Grid Floor / Origin Axes
    this.drawAxes(ctx, isDark);

    const projected = this.getProjectedNodes();
    const projMap = new Map();
    projected.forEach(p => projMap.set(p.node, p));

    // 1. Draw Constellation lines between nearest neighbors
    if (this.showLines) {
      ctx.lineWidth = 1;
      const drawnPairs = new Set();

      projected.forEach(p => {
        const neighbors = this.findNearestNeighbors(p.node, 2);
        neighbors.forEach(nb => {
          const np = projMap.get(nb.node);
          if (np) {
            const pairKey = [p.node.token, nb.node.token].sort().join('-');
            if (!drawnPairs.has(pairKey)) {
              drawnPairs.add(pairKey);
              const isHighlight = (this.selectedNode === p.node || this.selectedNode === nb.node);
              ctx.beginPath();
              ctx.moveTo(p.sx, p.sy);
              ctx.lineTo(np.sx, np.sy);
              if (isHighlight) {
                ctx.strokeStyle = isDark ? 'rgba(96, 165, 250, 0.8)' : 'rgba(37, 99, 235, 0.7)';
                ctx.lineWidth = 1.8;
              } else {
                ctx.strokeStyle = isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(148, 163, 184, 0.25)';
                ctx.lineWidth = 0.8;
              }
              ctx.stroke();
            }
          }
        });
      });
    }

    // 2. Draw Nodes & Labels
    projected.forEach(p => {
      const node = p.node;
      const isSelected = (node === this.selectedNode);
      const isHovered = (node === this.hoveredNode);
      const isNew = (node === this.newlyAddedToken && this.beaconPulse > 0);

      // Expanding beacon wave for newly added custom token!
      if (isNew) {
        ctx.beginPath();
        const beaconRadius = p.radius + (1.0 - this.beaconPulse) * 45;
        ctx.arc(p.sx, p.sy, beaconRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(236, 72, 153, ${this.beaconPulse * 0.8})`;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      // Outer Glow Halo
      ctx.beginPath();
      const glowRadius = isSelected ? p.radius * 2.8 : (isHovered ? p.radius * 2.2 : p.radius * 1.5);
      ctx.arc(p.sx, p.sy, glowRadius, 0, Math.PI * 2);
      ctx.fillStyle = isSelected
        ? (isDark ? 'rgba(96, 165, 250, 0.35)' : 'rgba(37, 99, 235, 0.25)')
        : `${node.color}${isDark ? '33' : '26'}`;
      ctx.fill();

      // Core Sphere
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? '#ffffff' : node.color;
      ctx.fill();

      // Border Ring
      ctx.lineWidth = isSelected ? 2.5 : 1.2;
      ctx.strokeStyle = isSelected ? '#2563eb' : (isDark ? '#0f172a' : '#ffffff');
      ctx.stroke();

      // Floating Text Label
      ctx.font = `${isSelected || isHovered ? 'bold 12px' : '10px'} 'JetBrains Mono', monospace`;
      ctx.fillStyle = isSelected
        ? (isDark ? '#60a5fa' : '#1d4ed8')
        : (isDark ? '#e2e8f0' : '#334155');
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(node.token, p.sx, p.sy - p.radius - 3);

      // Star badge for user-added token
      if (node.isUserAdded) {
        ctx.font = '8px sans-serif';
        ctx.fillText('✨', p.sx + p.radius + 6, p.sy - 2);
      }
    });
  }

  drawAxes(ctx, isDark) {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const fov = 400 * this.zoom;
    const cosY = Math.cos(this.rotY);
    const sinY = Math.sin(this.rotY);
    const cosX = Math.cos(this.rotX);
    const sinX = Math.sin(this.rotX);

    const projectPoint = (x, y, z) => {
      let x1 = x * cosY + z * sinY;
      let y1 = y;
      let z1 = -x * sinY + z * cosY;

      let x2 = x1;
      let y2 = y1 * cosX - z1 * sinX;
      let z2 = y1 * sinX + z1 * cosX;

      const zDepth = z2 + 380;
      if (zDepth <= 20) return null;
      const scale = fov / zDepth;
      return { sx: cx + x2 * scale, sy: cy - y2 * scale };
    };

    const origin = projectPoint(0, 0, 0);
    const pX = projectPoint(180, 0, 0);
    const pY = projectPoint(0, 180, 0);
    const pZ = projectPoint(0, 0, 180);

    if (origin && pX && pY && pZ) {
      // X axis
      ctx.beginPath();
      ctx.moveTo(origin.sx, origin.sy);
      ctx.lineTo(pX.sx, pX.sy);
      ctx.strokeStyle = isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.4)';
      ctx.stroke();

      // Y axis
      ctx.beginPath();
      ctx.moveTo(origin.sx, origin.sy);
      ctx.lineTo(pY.sx, pY.sy);
      ctx.strokeStyle = isDark ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.4)';
      ctx.stroke();

      // Z axis
      ctx.beginPath();
      ctx.moveTo(origin.sx, origin.sy);
      ctx.lineTo(pZ.sx, pZ.sy);
      ctx.strokeStyle = isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.4)';
      ctx.stroke();
    }
  }

  setFilter(cluster) {
    this.filteredCluster = cluster;
  }

  resetCamera() {
    this.rotX = 0.35;
    this.rotY = -0.55;
    this.zoom = 1.0;
    this.autoRotate = true;
    this.selectedNode = null;
  }
}
