import Link from 'next/link';

const sections = [
  { id: 'overview', title: 'Overview' },
  { id: 'tech-stack', title: 'Tech Stack' },
  { id: 'folder-structure', title: 'Folder Structure' },
  { id: 'type-system', title: 'Type System' },
  { id: 'rendering-pipeline', title: 'Canvas Rendering Pipeline' },
  { id: 'coordinate-system', title: 'Coordinate System' },
  { id: 'state-management', title: 'State Management' },
  { id: 'interaction-state-machine', title: 'Interaction State Machine' },
  { id: 'custom-hooks', title: 'Custom Hooks Architecture' },
  { id: 'event-handling', title: 'Event Handling' },
  { id: 'undo-redo', title: 'Undo / Redo' },
  { id: 'hit-testing', title: 'Hit Testing & Selection' },
  { id: 'performance', title: 'Performance' },
  { id: 'docker', title: 'Docker' },
  { id: 'ci-cd', title: 'CI / CD' },
  { id: 'interview-questions', title: 'Interview Q&A' },
];

function Code({ children, block }: { children: string; block?: boolean }) {
  if (block) {
    return (
      <pre className="bg-zinc-900 text-gray-100 rounded-lg p-4 text-sm leading-relaxed overflow-x-auto my-4 border border-zinc-800">
        <code>{children}</code>
      </pre>
    );
  }
  return (
    <code className="bg-gray-100 text-indigo-700 px-1.5 py-0.5 rounded text-[0.85em] font-mono">
      {children}
    </code>
  );
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-2xl font-bold text-gray-900 mt-16 mb-4 pt-4 border-t border-gray-200 scroll-mt-8">
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold text-gray-800 mt-8 mb-3">{children}</h3>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-600 leading-7 mb-4">{children}</p>;
}

function Callout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-lg px-5 py-4 my-6">
      <div className="font-semibold text-indigo-800 mb-1">{title}</div>
      <div className="text-indigo-700 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

function Warn({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-lg px-5 py-4 my-6">
      <div className="text-amber-800 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

function QA({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <div className="font-semibold text-gray-900 mb-2">Q: {q}</div>
      <div className="text-gray-600 leading-7 pl-4 border-l-2 border-gray-200">{children}</div>
    </div>
  );
}

export default function DocsPage() {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-gray-200 bg-gray-50 sticky top-0 h-screen overflow-y-auto p-6">
        <Link href="/" className="text-lg font-black text-indigo-500 mb-6 no-underline" style={{ fontFamily: 'Caveat, cursive' }}>
          Excalidraw Clone
        </Link>
        <nav className="flex flex-col gap-0.5">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="text-[13px] text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-md no-underline transition-colors"
            >
              {s.title}
            </a>
          ))}
        </nav>
        <div className="mt-auto pt-6">
          <Link href="/" className="text-sm text-indigo-600 hover:text-indigo-800 no-underline">
            ← Back to App
          </Link>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 max-w-3xl mx-auto px-6 md:px-12 py-12">
        <div className="mb-2">
          <Link href="/" className="text-sm text-indigo-600 hover:text-indigo-800 no-underline lg:hidden">
            ← Back to App
          </Link>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">Architecture Documentation</h1>
        <p className="text-lg text-gray-500 mb-12">
          Complete internals of the Excalidraw Clone — from canvas rendering to Docker deployment.
        </p>

        {/* ─── 1. Overview ─────────────────────────────────────────── */}

        <H2 id="overview">Overview</H2>
        <P>
          This is a from-scratch clone of <a href="https://excalidraw.com" className="text-indigo-600 hover:underline" target="_blank">Excalidraw</a>,
          the popular hand-drawn-style whiteboard tool. No official Excalidraw library is used — every pixel
          is rendered by our own code using the HTML Canvas API and <Code>rough.js</Code> for the sketchy aesthetic.
        </P>
        <P>
          The app supports 10 tools (select, hand, rectangle, ellipse, diamond, arrow, line, freehand pen, text, eraser),
          infinite canvas with pan/zoom, undo/redo, element properties editing, dark/light themes, grid overlay,
          PNG export, and is deployable both on Vercel and as a Docker container.
        </P>

        {/* ─── 2. Tech Stack ──────────────────────────────────────── */}

        <H2 id="tech-stack">Tech Stack</H2>
        <div className="grid grid-cols-2 gap-3 my-4">
          {[
            ['Next.js 16', 'App Router, dynamic imports with ssr:false for canvas-heavy code'],
            ['React 19', 'Hooks, Context API, memo, refs for mutable state'],
            ['TypeScript', 'Strict mode, discriminated unions for element types'],
            ['Tailwind CSS 4', 'Utility-first styling, no CSS files for components'],
            ['rough.js', 'Generates SVG-like hand-drawn paths from geometric primitives'],
            ['HTML Canvas', 'Low-level 2D rendering with DPR-aware sizing'],
            ['Docker', 'Multi-stage build, standalone Next.js output, ~70MB image'],
            ['Vercel', 'Production hosting with automatic deployments from GitHub'],
          ].map(([name, desc]) => (
            <div key={name} className="border border-gray-200 rounded-lg p-3">
              <div className="font-semibold text-gray-900 text-sm">{name}</div>
              <div className="text-gray-500 text-xs mt-0.5">{desc}</div>
            </div>
          ))}
        </div>

        <Callout title="Why not use SVG?">
          SVG re-renders the entire DOM tree when elements change. Canvas gives us pixel-level control
          and performs better with thousands of elements because we control exactly what gets redrawn
          in a single <Code>requestAnimationFrame</Code> loop.
        </Callout>

        {/* ─── 3. Folder Structure ────────────────────────────────── */}

        <H2 id="folder-structure">Folder Structure</H2>
        <Code block>{`src/
├── app/                       # Next.js App Router
│   ├── page.tsx               # Entry point — AppProvider + dynamic import
│   ├── layout.tsx             # Root HTML layout
│   ├── globals.css            # Tailwind import + base resets
│   └── docs/page.tsx          # This documentation page
│
├── context/
│   └── AppContext.tsx          # React Context — all shared state + refs
│
├── hooks/
│   ├── index.ts               # Barrel export
│   ├── useHistory.ts          # Undo/redo snapshot stack
│   ├── useViewport.ts         # Zoom-around + pan logic
│   ├── useTextEditing.ts      # Textarea lifecycle (start/commit)
│   ├── useKeyboardShortcuts.ts # All keyboard bindings
│   ├── useCanvasInteraction.ts # mousedown/move/up + wheel handlers
│   └── useRenderLoop.ts       # requestAnimationFrame loop
│
├── components/
│   ├── ExcalidrawApp.tsx       # Orchestrator (~160 lines)
│   ├── Toolbar.tsx             # Left tool sidebar (React.memo)
│   ├── PropertiesPanel.tsx     # Right properties panel (React.memo)
│   └── ZoomControls/
│       └── ZoomControls.tsx    # Bottom zoom bar (React.memo)
│
├── lib/                        # Pure functions — no React, no side effects
│   ├── constants.ts            # Colors, thresholds, grid size
│   ├── elements.ts             # Element factory functions + text measurement
│   ├── geometry.ts             # Hit testing, coordinate transforms, resizing
│   └── renderScene.ts          # The entire canvas rendering pipeline
│
└── types/
    ├── index.ts                # All element types, Viewport, DrawingProperties
    └── interaction.ts          # Interaction state machine type`}</Code>
        <P>
          The architecture follows <strong>Separation of Concerns</strong>: <Code>lib/</Code> contains
          pure functions with zero React dependency. <Code>hooks/</Code> contain React-specific logic.
          <Code>components/</Code> are purely presentational. <Code>context/</Code> is the glue.
        </P>

        {/* ─── 4. Type System ─────────────────────────────────────── */}

        <H2 id="type-system">Type System</H2>
        <H3>Discriminated Union Pattern</H3>
        <P>
          Every element in the scene has a <Code>type</Code> field that TypeScript uses as a discriminant.
          This is a <strong>discriminated union</strong> — the compiler narrows the type inside <Code>switch</Code> statements
          automatically.
        </P>
        <Code block>{`// Each element interface extends BaseElement and adds its own 'type' literal
interface BaseElement {
  id: string;
  x: number; y: number;
  width: number; height: number;
  strokeColor: string;
  fillColor: string;
  // ... shared properties
}

interface RectangleElement extends BaseElement { type: 'rectangle' }
interface ArrowElement extends BaseElement     { type: 'arrow'; points: Point[] }
interface FreedrawElement extends BaseElement  { type: 'freedraw'; points: Point[]; pressures: number[] }
interface TextElement extends BaseElement      { type: 'text'; text: string; fontSize: number }

// The union — TypeScript narrows based on 'type'
type ExcalidrawElement =
  | RectangleElement | EllipseElement | DiamondElement
  | ArrowElement | LineElement | FreedrawElement | TextElement;`}</Code>
        <Callout title="Interview tip">
          When you write <Code>{'switch (element.type) { case "arrow": ... }'}</Code>, TypeScript knows inside
          that case block that <Code>element</Code> is <Code>ArrowElement</Code>, so <Code>element.points</Code> is
          accessible without any type assertion. This is called <strong>type narrowing via discriminated unions</strong>.
        </Callout>

        <H3>Why Points are Relative</H3>
        <P>
          For <Code>ArrowElement</Code>, <Code>LineElement</Code>, and <Code>FreedrawElement</Code>, the
          <Code>points</Code> array stores coordinates <strong>relative to the element&apos;s origin</strong> (its <Code>x, y</Code>).
          The first point is always <Code>{'{x: 0, y: 0}'}</Code>. This means moving an arrow just changes <Code>x</Code> and
          <Code>y</Code> — the points array stays untouched. It decouples position from shape.
        </P>

        {/* ─── 5. Canvas Rendering Pipeline ───────────────────────── */}

        <H2 id="rendering-pipeline">Canvas Rendering Pipeline</H2>
        <P>
          The function <Code>renderScene()</Code> in <Code>lib/renderScene.ts</Code> runs inside a
          <Code>requestAnimationFrame</Code> loop (~60fps). Every frame, it redraws the entire scene
          from scratch. Here is the exact pipeline:
        </P>
        <Code block>{`function renderScene(canvas, state) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio;   // e.g. 2 on Retina

  // Step 1: Size the canvas buffer to match physical pixels
  canvas.width  = canvas.offsetWidth  * dpr;   // CSS pixels × DPR
  canvas.height = canvas.offsetHeight * dpr;

  // Step 2: Scale context so we draw in CSS pixel units
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  // Step 3: Fill background
  ctx.fillRect(0, 0, cssWidth, cssHeight);

  // Step 4: Apply viewport transform (world space)
  ctx.save();
  ctx.scale(zoom, zoom);
  ctx.translate(-offsetX, -offsetY);

  // Step 5: Draw grid lines (in world coords)
  // Step 6: Draw each element via rough.js (in world coords)
  // Step 7: Draw lasso selection rectangle (in world coords)

  ctx.restore();

  // Step 8: Draw selection handles (in screen/CSS pixel coords)
}`}</Code>

        <H3>Device Pixel Ratio (DPR)</H3>
        <P>
          On a Retina display, <Code>devicePixelRatio</Code> is 2. A CSS pixel is actually 2×2 physical pixels.
          If we set <Code>canvas.width = 800</Code> for an 800px-wide element, it looks blurry on Retina because
          it&apos;s only 800 physical pixels stretched across 1600 physical pixels.
        </P>
        <P>
          The fix: set <Code>canvas.width = cssWidth * dpr</Code> (1600), then apply
          <Code>ctx.setTransform(dpr, 0, 0, dpr, 0, 0)</Code> so all our drawing commands still use CSS pixel units.
          The canvas internally maps each CSS pixel to <Code>dpr × dpr</Code> physical pixels — crisp rendering.
        </P>

        <H3>Why rough.js Gets a Seed</H3>
        <P>
          Each element stores a random <Code>seed</Code> value. This seed is passed to rough.js so the
          hand-drawn wobble is <strong>deterministic</strong> — the same element looks the same every frame.
          Without a seed, rough.js would generate different random strokes on every render, causing the drawing to &quot;jitter&quot;.
        </P>

        <H3>Selection Handles in Screen Space</H3>
        <P>
          Selection handles (the 8 blue squares) are drawn <strong>after</strong> <Code>ctx.restore()</Code>, which
          pops the viewport transform. This means they&apos;re in CSS pixel coordinates. Why? Because handles must
          always be the same size on screen regardless of zoom level. If they were drawn in world space, zooming out
          would shrink them to invisible dots.
        </P>

        {/* ─── 6. Coordinate System ───────────────────────────────── */}

        <H2 id="coordinate-system">Coordinate System</H2>
        <P>
          There are <strong>three</strong> coordinate spaces in this app:
        </P>
        <div className="overflow-x-auto my-4">
          <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Space</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Description</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Example</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-2 font-mono text-indigo-700">Client (Page)</td>
                <td className="px-4 py-2 text-gray-600"><Code>e.clientX</Code>, <Code>e.clientY</Code> — relative to the browser viewport</td>
                <td className="px-4 py-2 text-gray-600">Mouse cursor at (500, 300) on screen</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-indigo-700">Screen (Canvas)</td>
                <td className="px-4 py-2 text-gray-600"><Code>clientX - rect.left</Code> — relative to the canvas element</td>
                <td className="px-4 py-2 text-gray-600">If toolbar is 56px wide, screen X = 500 - 56 = 444</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-indigo-700">World (Scene)</td>
                <td className="px-4 py-2 text-gray-600">The infinite canvas where elements live</td>
                <td className="px-4 py-2 text-gray-600">A rectangle at world (1200, 800)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <H3>The Transform Formula</H3>
        <Code block>{`// Client → World (used when handling mouse events)
worldX = (clientX - canvasRect.left) / zoom + offsetX
worldY = (clientY - canvasRect.top)  / zoom + offsetY

// World → Screen (used by the canvas transform)
screenX = (worldX - offsetX) * zoom
screenY = (worldY - offsetY) * zoom`}</Code>
        <P>
          The function <Code>clientToWorld()</Code> in <Code>lib/geometry.ts</Code> implements the first formula.
          The viewport transform in <Code>renderScene()</Code> (<Code>ctx.scale(zoom) → ctx.translate(-offsetX, -offsetY)</Code>)
          implements the second.
        </P>

        <H3>Zoom Around a Point</H3>
        <P>
          When you pinch-to-zoom, the world point under your cursor must stay fixed. The math in <Code>useViewport.ts</Code>:
        </P>
        <Code block>{`// centerX/centerY = cursor position in CSS canvas pixels
const clamped = clamp(newZoom, MIN_ZOOM, MAX_ZOOM);
const newOffsetX = offsetX + centerX * (1/oldZoom - 1/clamped);
const newOffsetY = offsetY + centerY * (1/oldZoom - 1/clamped);`}</Code>
        <P>
          This derives from the constraint that <Code>screenToWorld(center)</Code> must return the same world
          point before and after the zoom change.
        </P>

        {/* ─── 7. State Management ────────────────────────────────── */}

        <H2 id="state-management">State Management</H2>
        <H3>React Context + useRef Hybrid</H3>
        <P>
          The app uses a hybrid approach: <strong>React state</strong> for things that should trigger re-renders
          (elements, selectedIds, viewport, theme) and <strong>refs</strong> for things that should not
          (in-progress drawing, interaction mode, space key state).
        </P>
        <Code block>{`// AppContext.tsx — the Provider holds both categories
const [elements, setElements] = useState<ExcalidrawElement[]>([]);  // re-renders UI
const drawingElRef = useRef<ExcalidrawElement | null>(null);         // no re-render
const interactionRef = useRef<Interaction>({ mode: 'idle' });        // no re-render`}</Code>

        <H3>The Stale Closure Problem and stateRef</H3>
        <P>
          Window-level event listeners (<Code>window.addEventListener(&apos;mousemove&apos;, ...)</Code>) are registered
          once in a <Code>useEffect</Code>. They capture the initial values of state in their closure.
          If <Code>elements</Code> changes, the listener still sees the old array.
        </P>
        <P>
          Solution: a <Code>stateRef</Code> that is updated after every render via <Code>useEffect</Code>.
          Event handlers read <Code>stateRef.current</Code> instead of the closure-captured state:
        </P>
        <Code block>{`// In AppContext.tsx
const stateRef = useRef<StateSnapshot>({ tool, elements, viewport, ... });
useEffect(() => {
  stateRef.current = { tool, elements, viewport, ... };
});

// In event handler (useCanvasInteraction.ts)
const onMouseMove = (e: MouseEvent) => {
  const { elements, viewport } = stateRef.current;  // always fresh
  // ...
};`}</Code>
        <Warn>
          <strong>Why useEffect and not direct assignment?</strong> React 19 lint rules forbid mutating refs
          during render (<Code>stateRef.current = ...</Code> in the component body). Using <Code>useEffect</Code> without
          a dependency array runs the update after every render, keeping the ref in sync while satisfying the linter.
        </Warn>

        {/* ─── 8. Interaction State Machine ───────────────────────── */}

        <H2 id="interaction-state-machine">Interaction State Machine</H2>
        <P>
          User interactions follow a state machine pattern stored in <Code>interactionRef</Code>.
          This determines how <Code>mousemove</Code> and <Code>mouseup</Code> behave.
        </P>
        <Code block>{`type Interaction =
  | { mode: 'idle' }
  | { mode: 'drawing';     startX; startY }       // shapes being drawn
  | { mode: 'freedrawing' }                        // freehand pen
  | { mode: 'selecting';   startX; startY }        // lasso selection
  | { mode: 'moving';      startX; startY; origPositions: Map }
  | { mode: 'resizing';    handle; startX; startY; origBounds; elementId }
  | { mode: 'panning';     startX; startY; origOffset }`}</Code>
        <P>
          The flow:
        </P>
        <Code block>{`mousedown → sets interaction mode based on tool + hit test
  ↓
mousemove → reads interactionRef.current.mode, dispatches accordingly
  ↓
mouseup   → commits the result (add element, push history), resets to 'idle'`}</Code>
        <P>
          This pattern avoids complex boolean flag combinations
          like <Code>isDragging && isResizing && !isPanning</Code>. The mode is always exactly one value.
        </P>
        <Callout title="Why a ref instead of state?">
          The interaction mode changes rapidly during a drag (every mousemove). If it were React state,
          every update would trigger a re-render and re-run the render function. Using a ref means zero
          re-renders during the drag — the RAF loop reads from the ref directly.
        </Callout>

        {/* ─── 9. Custom Hooks Architecture ───────────────────────── */}

        <H2 id="custom-hooks">Custom Hooks Architecture</H2>
        <P>
          The original <Code>ExcalidrawApp.tsx</Code> was 940 lines. It was refactored into 6 custom hooks,
          bringing it down to ~160 lines. Each hook owns a single concern:
        </P>
        <div className="overflow-x-auto my-4">
          <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Hook</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Responsibility</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Key detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-600">
              <tr><td className="px-4 py-2 font-mono text-indigo-700">useHistory</td><td className="px-4 py-2">Undo/redo with snapshot stack</td><td className="px-4 py-2">Deep-clones entire elements array per snapshot via <Code>JSON.parse(JSON.stringify(...))</Code></td></tr>
              <tr><td className="px-4 py-2 font-mono text-indigo-700">useViewport</td><td className="px-4 py-2">Zoom + pan math</td><td className="px-4 py-2">Clamps zoom between 0.1× and 20×, preserves world point under cursor</td></tr>
              <tr><td className="px-4 py-2 font-mono text-indigo-700">useTextEditing</td><td className="px-4 py-2">Inline text editing lifecycle</td><td className="px-4 py-2">Manages a <Code>&lt;textarea&gt;</Code> ref, auto-sizes it, measures text width/height on commit</td></tr>
              <tr><td className="px-4 py-2 font-mono text-indigo-700">useKeyboardShortcuts</td><td className="px-4 py-2">All keybindings</td><td className="px-4 py-2">Skips shortcuts when focus is in input/textarea/select</td></tr>
              <tr><td className="px-4 py-2 font-mono text-indigo-700">useCanvasInteraction</td><td className="px-4 py-2">Mouse down/move/up + wheel</td><td className="px-4 py-2">Registers mousemove/mouseup on <Code>window</Code> so dragging works outside canvas bounds</td></tr>
              <tr><td className="px-4 py-2 font-mono text-indigo-700">useRenderLoop</td><td className="px-4 py-2">requestAnimationFrame loop</td><td className="px-4 py-2">Reads from refs (not state) to avoid re-registering the loop</td></tr>
            </tbody>
          </table>
        </div>
        <P>
          All hooks access shared state via <Code>useAppState()</Code> (the context hook). They communicate
          through the context — no prop drilling.
        </P>

        {/* ─── 10. Event Handling ─────────────────────────────────── */}

        <H2 id="event-handling">Event Handling</H2>
        <H3>Why mousedown on Canvas, but mousemove/mouseup on Window?</H3>
        <P>
          <Code>onMouseDown</Code> is a React event on the <Code>&lt;canvas&gt;</Code> element. But <Code>mousemove</Code> and
          <Code>mouseup</Code> are registered on <Code>window</Code> via <Code>useEffect</Code>. Why?
        </P>
        <P>
          If you start drawing on the canvas and drag your mouse outside the canvas (or even outside the browser window),
          you still want the drawing to continue. Window-level listeners capture the mouse regardless of where
          it moves. If we only listened on the canvas, the drag would &quot;break&quot; at the canvas edge.
        </P>

        <H3>Space Key for Panning</H3>
        <P>
          Holding <Code>Space</Code> and dragging enters pan mode — similar to Figma and Photoshop.
          <Code>isSpaceRef</Code> is set on <Code>keydown</Code> and cleared on <Code>keyup</Code>.
          In <Code>handleMouseDown</Code>, if <Code>isSpaceRef.current</Code> is true, the interaction mode is set
          to <Code>panning</Code> regardless of the active tool.
        </P>

        <H3>Middle-Click Panning</H3>
        <P>
          <Code>e.button === 1</Code> (middle mouse button) also triggers panning. Combined with scroll-wheel
          panning and Space+drag, there are three ways to pan — matching real Excalidraw behavior.
        </P>

        {/* ─── 11. Undo / Redo ────────────────────────────────────── */}

        <H2 id="undo-redo">Undo / Redo</H2>
        <P>
          The history system uses a <strong>snapshot-based</strong> approach: every time a meaningful action completes
          (element drawn, moved, resized, deleted, or property changed), the entire <Code>elements[]</Code> array is
          deep-cloned and pushed onto a stack.
        </P>
        <Code block>{`// useHistory.ts
const historyRef = useRef({
  stack: [[]],   // stack[0] = initial empty state
  index: 0,      // pointer to current position
});

function pushHistory(elements) {
  const { stack, index } = historyRef.current;
  const newStack = stack.slice(0, index + 1);  // discard any "redo" entries
  newStack.push(deepClone(elements));
  historyRef.current = { stack: newStack, index: newStack.length - 1 };
}

function undo() {
  // move index backward, restore stack[index]
}

function redo() {
  // move index forward, restore stack[index]
}`}</Code>
        <Callout title="Trade-off: Snapshots vs Command Pattern">
          Snapshots are simple but use more memory (O(n) per snapshot where n = element count).
          The Command pattern (storing &quot;add element X&quot;, &quot;move element Y by dx,dy&quot;) uses less memory
          but is harder to implement correctly (every command needs an inverse).
          For a whiteboard app with typically &lt;1000 elements, snapshots are the pragmatic choice.
        </Callout>

        {/* ─── 12. Hit Testing & Selection ────────────────────────── */}

        <H2 id="hit-testing">Hit Testing &amp; Selection</H2>
        <H3>How Hit Testing Works</H3>
        <P>
          When you click on the canvas with the Select tool, the app must determine which element (if any)
          is under the cursor. <Code>getElementAtPoint()</Code> iterates elements in <strong>reverse z-order</strong> (last drawn = top)
          and returns the first match.
        </P>
        <P>
          For shapes (rectangle, ellipse, diamond): simple bounding box check.
        </P>
        <P>
          For lines, arrows, and freehand strokes: <strong>point-to-segment distance</strong>.
          For each consecutive pair of points, it computes the perpendicular distance from the click
          to the line segment. If any distance is less than the hit threshold (8px), it&apos;s a hit.
        </P>
        <Code block>{`function distanceToSegment(p, a, b) {
  // Project p onto the line defined by a→b
  // Clamp the projection to [0, 1] so it stays within the segment
  // Return the distance from p to the projected point
}

// For a line with points [p0, p1, p2]:
// Check distanceToSegment(click, p0, p1) and distanceToSegment(click, p1, p2)`}</Code>

        <H3>Resize Handles</H3>
        <P>
          When a single element is selected, 8 resize handles appear (nw, n, ne, e, se, s, sw, w).
          Handle positions are computed in <strong>screen space</strong> (not world space) so they
          remain the same size regardless of zoom. Clicking a handle enters the <Code>resizing</Code> interaction mode
          with the handle direction, original bounds, and the element ID stored.
        </P>
        <P>
          During the resize drag, <Code>applyResize()</Code> computes new bounds based on which handle is being dragged:
        </P>
        <Code block>{`// For 'se' (south-east) handle:
width  += dx;  // grows rightward
height += dy;  // grows downward

// For 'nw' (north-west) handle:
x += dx; width  -= dx;  // origin moves, size shrinks
y += dy; height -= dy;`}</Code>

        {/* ─── 13. Performance ────────────────────────────────────── */}

        <H2 id="performance">Performance</H2>
        <H3>React.memo on UI Components</H3>
        <P>
          <Code>Toolbar</Code>, <Code>PropertiesPanel</Code>, and <Code>ZoomControls</Code> are wrapped in
          <Code>React.memo()</Code>. This means they only re-render when their props actually change.
          During a drag operation where only <Code>elements</Code> changes,
          the toolbar doesn&apos;t re-render because its props (<Code>tool</Code>, <Code>canUndo</Code>, etc.) haven&apos;t changed.
        </P>

        <H3>Refs for Hot-Path Data</H3>
        <P>
          The in-progress drawing element (<Code>drawingElRef</Code>), selection rectangle (<Code>selRectRef</Code>),
          and interaction mode (<Code>interactionRef</Code>) are all refs. During a freehand draw, the points
          array is updated on every <Code>mousemove</Code> (hundreds of times per second). If these were state,
          React would schedule a re-render for each update. With refs, zero re-renders happen — the RAF
          loop reads from the ref directly.
        </P>

        <H3>useMemo for Derived Data</H3>
        <P>
          <Code>selectedElements</Code> (the filtered array of currently selected elements) is computed via
          <Code>useMemo</Code> so it only recalculates when <Code>elements</Code> or <Code>selectedIds</Code> change,
          not on every render.
        </P>

        <H3>requestAnimationFrame Loop</H3>
        <P>
          Instead of re-rendering React components when elements change, the canvas is repainted by a
          continuous RAF loop. This loop reads from <Code>stateRef.current</Code> and <Code>drawingElRef.current</Code>,
          computes the full scene, and paints it. The loop runs even when nothing changes (idle frames are cheap —
          just a clear + background fill + element iteration with no actual drawing).
        </P>

        {/* ─── 14. Docker ─────────────────────────────────────────── */}

        <H2 id="docker">Docker</H2>
        <H3>Multi-Stage Build</H3>
        <P>
          The Dockerfile has 3 stages. Only the final stage becomes the image:
        </P>
        <Code block>{`Stage 1: deps     → npm ci (installs node_modules)
Stage 2: builder  → npm run build (produces .next/standalone)
Stage 3: runner   → copies ONLY standalone output + static files
                    → runs as non-root user 'nextjs'
                    → ~70MB image (vs ~1GB if we shipped node_modules)`}</Code>

        <H3>Standalone Output</H3>
        <P>
          <Code>next.config.ts</Code> sets <Code>output: &quot;standalone&quot;</Code>. This tells Next.js to produce
          a self-contained <Code>server.js</Code> file that bundles only the production dependencies it needs.
          The result is a minimal Node.js server that doesn&apos;t require the full <Code>node_modules</Code> tree.
        </P>

        <H3>Layer Caching</H3>
        <P>
          <Code>COPY package.json package-lock.json* ./</Code> is done before <Code>COPY . .</Code>.
          Docker caches layers. If your source code changes but <Code>package.json</Code> didn&apos;t,
          the <Code>npm ci</Code> layer is reused from cache — skipping a 30+ second install.
        </P>

        {/* ─── 15. CI / CD ────────────────────────────────────────── */}

        <H2 id="ci-cd">CI / CD</H2>
        <Code block>{`# .github/workflows/ci.yml
name: CI
on:
  push:    { branches: [main] }
  pull_request: { branches: [main] }

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npm run build`}</Code>
        <P>
          Every push to <Code>main</Code> or PR against <Code>main</Code> triggers lint + build. Vercel also
          auto-deploys on push via its GitHub integration.
        </P>

        {/* ─── 16. Interview Q&A ──────────────────────────────────── */}

        <H2 id="interview-questions">Interview Q&amp;A</H2>
        <P>
          Common questions an interviewer might ask about this project, and how to answer them.
        </P>

        <QA q="Why did you use Canvas instead of SVG or DOM elements?">
          Canvas gives us pixel-level control and performs better with many elements because there&apos;s no DOM node per element.
          SVG creates a DOM node for each shape, which becomes slow with thousands of elements.
          Canvas also makes it easy to implement a viewport transform (pan/zoom) via a single <Code>ctx.scale + ctx.translate</Code>.
          The trade-off is we lose built-in event handling per element — we implement hit testing manually.
        </QA>

        <QA q="How do you handle the coordinate system with pan and zoom?">
          There are three coordinate spaces: client (browser), screen (canvas), and world (scene).
          Mouse events give us client coordinates. We subtract the canvas&apos;s bounding rect to get screen coordinates,
          then apply the inverse viewport transform: <Code>worldX = screenX / zoom + offsetX</Code>.
          For rendering, the canvas context applies the forward transform: <Code>ctx.scale(zoom), ctx.translate(-offsetX, -offsetY)</Code>.
        </QA>

        <QA q="What is the stale closure problem and how did you solve it?">
          Event listeners registered via <Code>window.addEventListener</Code> inside <Code>useEffect</Code> capture
          state values from the render when they were registered. If state changes later, the listener still sees
          the old values. We solve this with a <Code>stateRef</Code> that is synced after every render via <Code>useEffect</Code>.
          Listeners read <Code>stateRef.current</Code> instead of closure-captured state.
        </QA>

        <QA q="Why are some values stored in refs instead of state?">
          During a drag, the in-progress element updates on every <Code>mousemove</Code> — potentially 60+ times per second.
          If this were React state, each update would schedule a re-render, causing massive overhead.
          Using refs means zero re-renders during the drag. The RAF loop reads from the ref directly.
          We use state only for values that should trigger UI updates (toolbar, properties panel, zoom display).
        </QA>

        <QA q="How does your undo/redo work?">
          Snapshot-based. On every meaningful action, the entire elements array is deep-cloned and pushed onto a stack.
          Undo moves the stack pointer backward and restores that snapshot. Redo moves it forward.
          When a new action is performed after an undo, the redo stack is discarded (standard behavior).
          Trade-off: uses more memory than a command pattern, but much simpler to implement correctly.
        </QA>

        <QA q="How does hit testing work for freehand drawings?">
          For freehand strokes, we iterate over every consecutive pair of points and compute the
          perpendicular distance from the click point to that line segment. If any segment is within
          the hit threshold (8px), it&apos;s a hit. For rectangles and ellipses, we use simple bounding box checks.
          Elements are tested in reverse z-order so the topmost element is selected first.
        </QA>

        <QA q="How does rough.js produce consistent hand-drawn strokes?">
          Each element has a random <Code>seed</Code> value generated at creation time.
          This seed is passed to rough.js so the hand-drawn wobble is deterministic.
          Without it, rough.js generates different random strokes every frame, causing visual jitter.
        </QA>

        <QA q="Why did you use a multi-stage Docker build?">
          A single-stage build would include all dev dependencies (TypeScript, ESLint, Tailwind compiler)
          in the final image — easily 1GB+. Multi-stage lets us install deps in stage 1, build in stage 2,
          then copy only the production output into a clean Alpine image in stage 3. Result: ~70MB image.
          We also run as a non-root user for security.
        </QA>

        <QA q="What is devicePixelRatio and why does it matter for canvas rendering?">
          On high-DPI (Retina) displays, one CSS pixel maps to multiple physical pixels (e.g., 2×2).
          If we set <Code>canvas.width</Code> to the CSS width, the browser stretches the canvas to fill
          the physical pixels, causing blur. We set the canvas buffer to <Code>cssWidth × dpr</Code> and
          apply <Code>ctx.setTransform(dpr, 0, 0, dpr, 0, 0)</Code> so we still draw in CSS units
          but the canvas internally renders at full physical resolution.
        </QA>

        <QA q="How do you prevent the toolbar from re-rendering during drawing?">
          The Toolbar is wrapped in <Code>React.memo()</Code>. It only receives props like <Code>tool</Code>,
          <Code>canUndo</Code>, and <Code>theme</Code>. During a drawing operation, only <Code>elements</Code> changes
          (via <Code>setElements</Code>), but since <Code>elements</Code> is not a prop of Toolbar, memo prevents re-render.
          The PropertiesPanel and ZoomControls use the same pattern.
        </QA>

        <QA q="Why are mousemove/mouseup listeners on window instead of the canvas?">
          If you start drawing on the canvas and drag outside its bounds (or even outside the browser),
          canvas-level listeners would stop firing. Window-level listeners continue to receive events
          regardless of cursor position. This ensures drags never &quot;break&quot; at element boundaries.
        </QA>

        <div className="mt-16 pt-8 border-t border-gray-200 text-center">
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 no-underline font-medium">
            ← Back to App
          </Link>
          <p className="text-gray-400 text-sm mt-4">Excalidraw Clone — Architecture Documentation</p>
        </div>
      </main>
    </div>
  );
}
