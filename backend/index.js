const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 8080;

// Helper to validate node format X->Y
const isValidNode = (str) => {
    if (!str || typeof str !== 'string') return false;
    const trimmed = str.trim();
    const regex = /^[A-Z]->[A-Z]$/;
    return regex.test(trimmed) && trimmed[0] !== trimmed[trimmed.length - 1]; // trimmed[0] is X, trimmed[3] is Y
};

app.post('/bfhl', (req, res) => {
    const { data } = req.body;

    if (!data || !Array.isArray(data)) {
        return res.status(400).json({ is_success: false, message: "Invalid input format" });
    }

    const user_id = "harsha_e";
    const email_id = "he1157@srmist.edu.in";
    const college_roll_number = "RA2110033020727";

    const valid_edges = [];
    const invalid_entries = [];
    const duplicate_edges = [];
    const seen_edges = new Set();
    const child_to_parent = new Map();
    const nodes = new Set();

    data.forEach(entry => {
        const trimmed = entry.trim();
        if (!isValidNode(trimmed)) {
            invalid_entries.push(entry);
            return;
        }

        if (seen_edges.has(trimmed)) {
            duplicate_edges.push(entry);
            return;
        }

        const [parent, child] = trimmed.split('->');

        // Multi-parent check: first encountered parent wins
        if (child_to_parent.has(child)) {
            // Silently discard subsequent parent edges
            return;
        }

        seen_edges.add(trimmed);
        valid_edges.push({ parent, child });
        child_to_parent.set(child, parent);
        nodes.add(parent);
        nodes.add(child);
    });

    const adj = new Map();
    nodes.forEach(node => adj.set(node, []));
    valid_edges.forEach(({ parent, child }) => {
        adj.get(parent).push(child);
    });

    // Identify roots: nodes that are never children
    const all_children = new Set(child_to_parent.keys());
    const roots = [...nodes].filter(node => !all_children.has(node)).sort();

    // Grouping nodes into components (trees/cycles)
    const visited = new Set();
    const hierarchies = [];
    let total_trees = 0;
    let total_cycles = 0;
    let max_depth = 0;
    let largest_tree_root = "";

    const buildTree = (node, path) => {
        if (path.has(node)) return { cycle: true };
        visited.add(node);
        path.add(node);

        const children = adj.get(node) || [];
        const treeObj = {};
        let depth = 1;
        let hasCycle = false;

        children.forEach(child => {
            const result = buildTree(child, new Set(path));
            if (result.cycle) {
                hasCycle = true;
            } else {
                treeObj[child] = result.tree;
                depth = Math.max(depth, 1 + result.depth);
            }
        });

        return { tree: treeObj, depth, cycle: hasCycle };
    };

    // First process components starting from roots
    roots.forEach(root => {
        if (visited.has(root)) return;

        const result = buildTree(root, new Set());
        if (result.cycle) {
            total_cycles++;
            hierarchies.push({
                root: root,
                tree: {},
                has_cycle: true
            });
        } else {
            total_trees++;
            hierarchies.push({
                root: root,
                tree: { [root]: result.tree },
                depth: result.depth
            });

            if (result.depth > max_depth) {
                max_depth = result.depth;
                largest_tree_root = root;
            } else if (result.depth === max_depth) {
                if (!largest_tree_root || root < largest_tree_root) {
                    largest_tree_root = root;
                }
            }
        }
    });

    // Process remaining nodes (pure cycles)
    const remainingNodes = [...nodes].filter(node => !visited.has(node)).sort();
    while (remainingNodes.length > 0) {
        const startNode = remainingNodes[0];
        // For pure cycle, find all nodes in this component
        const componentNodes = [];
        const q = [startNode];
        const compVisited = new Set([startNode]);
        while (q.length > 0) {
            const curr = q.shift();
            componentNodes.push(curr);
            const neighbors = (adj.get(curr) || []).concat(child_to_parent.has(curr) ? [child_to_parent.get(curr)] : []);
            neighbors.forEach(n => {
                if (!compVisited.has(n)) {
                    compVisited.add(n);
                    q.push(n);
                }
            });
        }

        const root = componentNodes.sort()[0];
        total_cycles++;
        hierarchies.push({
            root: root,
            tree: {},
            has_cycle: true
        });

        componentNodes.forEach(n => {
            visited.add(n);
            const idx = remainingNodes.indexOf(n);
            if (idx > -1) remainingNodes.splice(idx, 1);
        });
    }

    res.json({
        user_id,
        email_id,
        college_roll_number,
        hierarchies,
        invalid_entries,
        duplicate_edges,
        summary: {
            total_trees,
            total_cycles,
            largest_tree_root
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
