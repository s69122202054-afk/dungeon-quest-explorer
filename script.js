// ==========================================
// 1. DATA STRUCTURE: TREE (โครงสร้างการตัดสินใจ)
// ==========================================
const questTree = {
    id: "start",
    name: "จุดเริ่มต้นผจญภัย (Root)",
    type: "Root",
    children: [
        {
            id: "forest_zone",
            name: "ป่าหมอกลึกลับ (Forest Realm)",
            type: "Parent",
            children: [
                {
                    id: "river_area",
                    name: "แม่น้ำศักดิ์สิทธิ์ (Mystic River)",
                    type: "Child",
                    children: [
                        { id: "hero_ending", name: "ฉากจบ: อัศวินแห่งแสง (Hero Ending)", type: "Leaf" },
                        { id: "lost_ending", name: "ฉากจบ: ผู้สูญหายในหมอก (Lost Ending)", type: "Leaf" }
                    ]
                },
                {
                    id: "ruins_area",
                    name: "ซากโบราณสถาน (Ancient Ruins)",
                    type: "Child",
                    children: [
                        { id: "treasure_ending", name: "ฉากจบ: นักล่าขุมทรัพย์ (Treasure Ending)", type: "Leaf" }
                    ]
                }
            ]
        },
        {
            id: "cave_zone",
            name: "หุบเขาและถ้ำหิน (Cave Realm)",
            type: "Parent",
            children: [
                {
                    id: "crystal_area",
                    name: "ถ้ำผลึกเวทมนตร์ (Crystal Cave)",
                    type: "Child",
                    children: [
                        { id: "dragon_ending", name: "ฉากจบ: ผู้พิชิตมังกร (Dragon Slayer Ending)", type: "Leaf" }
                    ]
                }
            ]
        }
    ]
};

// ==========================================
// 2. DATA STRUCTURE: GRAPH (Adjacency List)
// ==========================================
const mapGraph = {
    "Start Village": [
        { to: "Dark Forest", stamina: 10 },
        { to: "Crystal Cave", stamina: 15 }
    ],
    "Dark Forest": [
        { to: "Mystic River", stamina: 12 },
        { to: "Ancient Ruins", stamina: 20 }
    ],
    "Crystal Cave": [
        { to: "Ancient Ruins", stamina: 10 },
        { to: "Demon Castle", stamina: 35 }
    ],
    "Mystic River": [
        { to: "Demon Castle", stamina: 25 }
    ],
    "Ancient Ruins": [
        { to: "Demon Castle", stamina: 15 }
    ],
    "Demon Castle": []
};

// ==========================================
// 3. CANVAS GRAPH NODE POSITIONS
// ==========================================
const nodePositions = {
    "Start Village": { x: 60, y: 150 },
    "Dark Forest": { x: 200, y: 70 },
    "Crystal Cave": { x: 200, y: 230 },
    "Mystic River": { x: 360, y: 70 },
    "Ancient Ruins": { x: 360, y: 230 },
    "Demon Castle": { x: 500, y: 150 }
};

// ==========================================
// 4. GRAPH ALGORITHM: DIJKSTRA'S SHORTEST PATH
// ==========================================
function findQuestPath(startNode, targetNode) {
    let distances = {};
    let previous = {};
    let nodes = new Set();

    for (let vertex in mapGraph) {
        distances[vertex] = (vertex === startNode) ? 0 : Infinity;
        nodes.add(vertex);
    }

    while (nodes.size > 0) {
        let smallest = null;
        for (let node of nodes) {
            if (smallest === null || distances[node] < distances[smallest]) {
                smallest = node;
            }
        }

        if (smallest === targetNode || distances[smallest] === Infinity) {
            break;
        }

        nodes.delete(smallest);

        for (let neighbor of (mapGraph[smallest] || [])) {
            let alt = distances[smallest] + neighbor.stamina;
            if (alt < distances[neighbor.to]) {
                distances[neighbor.to] = alt;
                previous[neighbor.to] = { from: smallest, stamina: neighbor.stamina };
            }
        }
    }

    if (distances[targetNode] === Infinity) return null;

    let path = [];
    let curr = targetNode;
    while (curr) {
        if (previous[curr]) {
            path.unshift({ node: curr, stamina: previous[curr].stamina });
            curr = previous[curr].from;
        } else if (curr === startNode) {
            path.unshift({ node: curr, stamina: 0 });
            curr = null;
        } else {
            break;
        }
    }
    return path;
}

// ==========================================
// 5. SOUND EFFECTS (Web Audio API)
// ==========================================
function playSFX(type) {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'click') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(500, ctx.currentTime);
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            osc.start();
            osc.stop(ctx.currentTime + 0.04);
        } else if (type === 'success') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2);
            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            osc.start();
            osc.stop(ctx.currentTime + 0.2);
        } else if (type === 'reset') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(300, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
        }
    } catch(e) { console.log(e); }
}

// ==========================================
// 6. TREE TRAVERSAL ALGORITHMS
// ==========================================
function getPreorder(node, result = []) {
    if (!node) return result;
    result.push(node.name.split(" ")[0]);
    if (node.children) node.children.forEach(child => getPreorder(child, result));
    return result;
}

function getPostorder(node, result = []) {
    if (!node) return result;
    if (node.children) node.children.forEach(child => getPostorder(child, result));
    result.push(node.name.split(" ")[0]);
    return result;
}

function getBFS(root) {
    let result = [];
    let queue = [root];
    while (queue.length > 0) {
        let curr = queue.shift();
        result.push(curr.name.split(" ")[0]);
        if (curr.children) queue.push(...curr.children);
    }
    return result;
}

// ==========================================
// 7. CANVAS REAL-TIME MONOCHROME ANIMATION
// ==========================================
let monoAnimationFrame = null;

function drawGraphCanvas(canvasId, highlightPathNodes = []) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    if (monoAnimationFrame) {
        cancelAnimationFrame(monoAnimationFrame);
    }

    function renderLoop() {
        const time = Date.now() * 0.003;
        const pulse = (Math.sin(time) + 1) / 2;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Edges
        for (let u in mapGraph) {
            mapGraph[u].forEach(edge => {
                let v = edge.to;
                let p1 = nodePositions[u];
                let p2 = nodePositions[v];
                
                let isHighlighted = false;
                for (let i = 0; i < highlightPathNodes.length - 1; i++) {
                    if (highlightPathNodes[i] === u && highlightPathNodes[i+1] === v) {
                        isHighlighted = true;
                        break;
                    }
                }

                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.lineWidth = isHighlighted ? 5 : 2;
                
                if (isHighlighted) {
                    ctx.shadowBlur = 10 + pulse * 20;
                    ctx.shadowColor = "#ffffff";
                    ctx.strokeStyle = "#ffffff";
                } else {
                    ctx.shadowBlur = 0;
                    ctx.strokeStyle = "#333333";
                }
                ctx.stroke();

                let midX = (p1.x + p2.x) / 2;
                let midY = (p1.y + p2.y) / 2;
                ctx.shadowBlur = isHighlighted ? 10 : 0;
                ctx.shadowColor = "#ffffff";
                ctx.fillStyle = isHighlighted ? "#ffffff" : "#888888";
                ctx.font = "bold 12px Kanit, sans-serif";
                ctx.fillText(edge.stamina + " SP", midX, midY - 6);
            });
        }

        // Vertices
        for (let node in nodePositions) {
            let pos = nodePositions[node];
            let isPathNode = highlightPathNodes.includes(node);

            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 22, 0, 2 * Math.PI);
            
            if (isPathNode) {
                ctx.shadowBlur = 15 + pulse * 25;
                ctx.shadowColor = "#ffffff";
                ctx.fillStyle = pulse > 0.5 ? "#ffffff" : "#000000";
            } else {
                ctx.shadowBlur = 4;
                ctx.shadowColor = "#ffffff";
                ctx.fillStyle = "#000000";
            }
            
            ctx.fill();
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#ffffff";
            ctx.stroke();

            ctx.shadowBlur = 0;
            ctx.fillStyle = (isPathNode && pulse > 0.5) ? "#000000" : "#ffffff";
            ctx.font = "bold 10px Kanit, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(node.split(" ")[0], pos.x, pos.y + 3);
        }

        monoAnimationFrame = requestAnimationFrame(renderLoop);
    }

    renderLoop();
}

// ==========================================
// 8. LOCAL STORAGE HELPERS
// ==========================================
function getSelectedEnding() {
    return localStorage.getItem("selectedEnding") || "ยังไม่ได้เลือกฉากจบ (กรุณาเลือกในหน้า 1)";
}

function getSelectedQuestTreePath() {
    return localStorage.getItem("selectedQuestTreePath") || "Root";
}

function resetAllData() {
    playSFX('reset');
    localStorage.clear();
    window.location.href = "index.html";
}