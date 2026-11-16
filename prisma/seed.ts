/**
 * prisma/seed.ts
 *
 * Seeds the ExamCatalog / CatalogSubject / CatalogTopic tables from the
 * canonical exam data that previously lived in lib/examTemplates.ts.
 *
 * Run with:  npx prisma db seed
 *
 * The seed uses upsert everywhere so it is safe to re-run — existing rows
 * are updated, not duplicated.  New exams can be added here without touching
 * any application code.
 */

import { PrismaClient, Priority, Difficulty } from "@prisma/client";

const prisma = new PrismaClient();

// ─── Type helpers ────────────────────────────────────────────────────────────

interface SeedTopic {
  name: string;
  estimatedHours: number;
  priority: Priority;
  difficulty: Difficulty;
}

interface SeedSubject {
  name: string;
  color: string;
  topics: SeedTopic[];
}

interface SeedExam {
  slug: string;
  label: string;
  description: string;
  icon: string;
  subjects: SeedSubject[];
}

// ─── Catalog data ─────────────────────────────────────────────────────────────
// To add a new exam: append an entry to this array.  No other file needs to
// change — the onboarding system will automatically discover it.

const CATALOG: SeedExam[] = [
  // ── GATE CSE ──────────────────────────────────────────────────────────────
  {
    slug: "GATE_CSE",
    label: "GATE CSE",
    description: "Full GATE Computer Science syllabus with standard weightages",
    icon: "🎓",
    subjects: [
      {
        name: "Data Structures & Algorithms",
        color: "#7C3AED",
        topics: [
          { name: "Arrays & Strings", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Linked Lists", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Stacks & Queues", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Trees & Binary Trees", estimatedHours: 5, priority: "HIGH", difficulty: "HARD" },
          { name: "Binary Search Trees", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "Heaps & Priority Queues", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Hashing", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Graphs — BFS & DFS", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "Shortest Paths — Dijkstra, Bellman-Ford, Floyd-Warshall", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "Minimum Spanning Trees — Kruskal, Prim", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Sorting Algorithms", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Divide & Conquer", estimatedHours: 3, priority: "MEDIUM", difficulty: "MEDIUM" },
          { name: "Dynamic Programming", estimatedHours: 6, priority: "HIGH", difficulty: "HARD" },
          { name: "Greedy Algorithms", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Asymptotic Complexity & Recurrences", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "NP-Completeness Basics", estimatedHours: 2, priority: "MEDIUM", difficulty: "HARD" },
        ],
      },
      {
        name: "Operating Systems",
        color: "#2563EB",
        topics: [
          { name: "Process Management & Scheduling", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "CPU Scheduling Algorithms", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Process Synchronisation — Semaphores, Monitors", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "Deadlocks — Detection, Prevention, Avoidance", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "Memory Management — Paging, Segmentation", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Virtual Memory & Page Replacement", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "File Systems", estimatedHours: 3, priority: "MEDIUM", difficulty: "MEDIUM" },
          { name: "I/O Systems & Disk Scheduling", estimatedHours: 2, priority: "MEDIUM", difficulty: "EASY" },
          { name: "Threads & Concurrency", estimatedHours: 2, priority: "MEDIUM", difficulty: "MEDIUM" },
        ],
      },
      {
        name: "Computer Networks",
        color: "#059669",
        topics: [
          { name: "OSI & TCP/IP Models", estimatedHours: 3, priority: "HIGH", difficulty: "EASY" },
          { name: "Data Link Layer — Framing, Error & Flow Control", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "MAC Protocols — CSMA/CD, CSMA/CA", estimatedHours: 2, priority: "MEDIUM", difficulty: "MEDIUM" },
          { name: "IP Addressing & Subnetting", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Routing Algorithms — OSPF, RIP, BGP", estimatedHours: 3, priority: "HIGH", difficulty: "HARD" },
          { name: "TCP & UDP", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Congestion Control", estimatedHours: 3, priority: "HIGH", difficulty: "HARD" },
          { name: "Application Layer — DNS, HTTP, SMTP, FTP", estimatedHours: 2, priority: "MEDIUM", difficulty: "EASY" },
          { name: "Network Security Basics", estimatedHours: 2, priority: "LOW", difficulty: "MEDIUM" },
        ],
      },
      {
        name: "DBMS",
        color: "#D97706",
        topics: [
          { name: "ER Model & Relational Model", estimatedHours: 3, priority: "HIGH", difficulty: "EASY" },
          { name: "Relational Algebra & Calculus", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "SQL — Queries, Joins, Subqueries", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Functional Dependencies & Normalisation", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "Transactions & ACID Properties", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Concurrency Control — 2PL, Timestamps", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "Indexing & B+ Trees", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Query Optimisation", estimatedHours: 2, priority: "MEDIUM", difficulty: "HARD" },
        ],
      },
      {
        name: "Theory of Computation",
        color: "#DC2626",
        topics: [
          { name: "Finite Automata — DFA, NFA", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Regular Expressions & Regular Languages", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Pumping Lemma for Regular Languages", estimatedHours: 2, priority: "MEDIUM", difficulty: "HARD" },
          { name: "Context-Free Grammars & PDAs", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "Pumping Lemma for CFLs", estimatedHours: 2, priority: "MEDIUM", difficulty: "HARD" },
          { name: "Turing Machines", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "Decidability & Undecidability", estimatedHours: 3, priority: "HIGH", difficulty: "HARD" },
          { name: "Complexity Classes — P, NP", estimatedHours: 2, priority: "MEDIUM", difficulty: "HARD" },
        ],
      },
      {
        name: "Digital Logic",
        color: "#0891B2",
        topics: [
          { name: "Boolean Algebra & Minimisation", estimatedHours: 3, priority: "HIGH", difficulty: "EASY" },
          { name: "Karnaugh Maps", estimatedHours: 2, priority: "HIGH", difficulty: "EASY" },
          { name: "Combinational Circuits — Mux, Decoder, Adder", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Sequential Circuits — Flip-flops, Counters", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Number Systems & Codes", estimatedHours: 2, priority: "MEDIUM", difficulty: "EASY" },
        ],
      },
      {
        name: "Computer Organisation & Architecture",
        color: "#DB2777",
        topics: [
          { name: "Machine Instructions & Addressing Modes", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "ALU & Data Path", estimatedHours: 3, priority: "MEDIUM", difficulty: "MEDIUM" },
          { name: "Pipelining & Hazards", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "Cache Memory — Mapping, Replacement", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "Memory Hierarchy & Performance", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "I/O Organisation & Interrupts", estimatedHours: 2, priority: "MEDIUM", difficulty: "MEDIUM" },
        ],
      },
      {
        name: "Programming & C",
        color: "#7C3AED",
        topics: [
          { name: "C Programming Fundamentals", estimatedHours: 3, priority: "HIGH", difficulty: "EASY" },
          { name: "Pointers & Memory Management", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Recursion", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
        ],
      },
      {
        name: "Compiler Design",
        color: "#2563EB",
        topics: [
          { name: "Lexical Analysis & Regex", estimatedHours: 2, priority: "MEDIUM", difficulty: "MEDIUM" },
          { name: "Parsing — LL, LR, LALR", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "Syntax-Directed Translation", estimatedHours: 2, priority: "MEDIUM", difficulty: "MEDIUM" },
          { name: "Intermediate Code Generation", estimatedHours: 2, priority: "MEDIUM", difficulty: "MEDIUM" },
          { name: "Code Optimisation & Generation", estimatedHours: 2, priority: "LOW", difficulty: "HARD" },
        ],
      },
      {
        name: "Discrete Mathematics",
        color: "#059669",
        topics: [
          { name: "Set Theory & Logic", estimatedHours: 3, priority: "HIGH", difficulty: "EASY" },
          { name: "Relations & Functions", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Combinatorics & Counting", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Graph Theory", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Probability & Statistics", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Linear Algebra", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "Calculus & Numerical Methods", estimatedHours: 3, priority: "MEDIUM", difficulty: "MEDIUM" },
        ],
      },
    ],
  },

  // ── GATE ECE ──────────────────────────────────────────────────────────────
  {
    slug: "GATE_ECE",
    label: "GATE ECE",
    description: "Full GATE Electronics & Communication Engineering syllabus",
    icon: "⚡",
    subjects: [
      {
        name: "Engineering Mathematics",
        color: "#7C3AED",
        topics: [
          { name: "Linear Algebra", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Calculus & Differential Equations", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Complex Variables", estimatedHours: 3, priority: "MEDIUM", difficulty: "HARD" },
          { name: "Probability & Statistics", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Numerical Methods", estimatedHours: 2, priority: "MEDIUM", difficulty: "EASY" },
          { name: "Transform Theory — Laplace, Fourier, Z", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
        ],
      },
      {
        name: "Networks & Circuits",
        color: "#2563EB",
        topics: [
          { name: "Network Theorems — Thevenin, Norton, Superposition", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Transient & Steady-State AC Analysis", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "Two-Port Networks", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Graph Theory Applied to Networks", estimatedHours: 2, priority: "MEDIUM", difficulty: "MEDIUM" },
        ],
      },
      {
        name: "Signals & Systems",
        color: "#059669",
        topics: [
          { name: "Continuous & Discrete Time Signals", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Fourier Series & Transform", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "Laplace Transform & Z-Transform", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "LTI Systems — Convolution, Stability", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Sampling Theorem", estimatedHours: 2, priority: "MEDIUM", difficulty: "MEDIUM" },
        ],
      },
      {
        name: "Electronic Devices",
        color: "#D97706",
        topics: [
          { name: "Semiconductor Physics & PN Junction", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "BJT & MOSFET Characteristics", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "Diode Circuits & Applications", estimatedHours: 3, priority: "MEDIUM", difficulty: "MEDIUM" },
        ],
      },
      {
        name: "Analog Circuits",
        color: "#DC2626",
        topics: [
          { name: "Small Signal Amplifiers", estimatedHours: 3, priority: "HIGH", difficulty: "HARD" },
          { name: "Op-Amp & Applications", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Feedback Amplifiers & Oscillators", estimatedHours: 3, priority: "HIGH", difficulty: "HARD" },
          { name: "Power Amplifiers", estimatedHours: 2, priority: "MEDIUM", difficulty: "MEDIUM" },
          { name: "Filters — Active & Passive", estimatedHours: 3, priority: "MEDIUM", difficulty: "MEDIUM" },
        ],
      },
      {
        name: "Digital Circuits",
        color: "#0891B2",
        topics: [
          { name: "Boolean Algebra & Minimisation", estimatedHours: 2, priority: "HIGH", difficulty: "EASY" },
          { name: "Combinational Logic Design", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Sequential Logic — Flip-flops, Counters", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "A/D & D/A Converters", estimatedHours: 2, priority: "MEDIUM", difficulty: "MEDIUM" },
          { name: "Semiconductor Memories", estimatedHours: 2, priority: "LOW", difficulty: "EASY" },
        ],
      },
      {
        name: "Control Systems",
        color: "#DB2777",
        topics: [
          { name: "Transfer Functions & Block Diagrams", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Time Domain Analysis", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Frequency Domain — Bode, Nyquist", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "Root Locus", estimatedHours: 3, priority: "HIGH", difficulty: "HARD" },
          { name: "State Space Analysis", estimatedHours: 3, priority: "MEDIUM", difficulty: "HARD" },
        ],
      },
      {
        name: "Communications",
        color: "#7C3AED",
        topics: [
          { name: "Amplitude & Angle Modulation", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Digital Modulation — ASK, FSK, PSK, QAM", estimatedHours: 3, priority: "HIGH", difficulty: "HARD" },
          { name: "Noise in Communication Systems", estimatedHours: 3, priority: "HIGH", difficulty: "HARD" },
          { name: "Information Theory & Channel Capacity", estimatedHours: 3, priority: "MEDIUM", difficulty: "HARD" },
          { name: "Error Control Coding", estimatedHours: 2, priority: "MEDIUM", difficulty: "HARD" },
        ],
      },
      {
        name: "Electromagnetics",
        color: "#2563EB",
        topics: [
          { name: "Maxwell's Equations & Wave Propagation", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "Transmission Lines", estimatedHours: 3, priority: "HIGH", difficulty: "HARD" },
          { name: "Waveguides & Antennas", estimatedHours: 3, priority: "MEDIUM", difficulty: "HARD" },
        ],
      },
    ],
  },

  // ── JEE ───────────────────────────────────────────────────────────────────
  {
    slug: "JEE",
    label: "JEE",
    description: "JEE Mains + Advanced — Physics, Chemistry, Mathematics",
    icon: "⚛️",
    subjects: [
      {
        name: "Mathematics",
        color: "#7C3AED",
        topics: [
          { name: "Sets, Relations & Functions", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Complex Numbers", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "Quadratic Equations", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Sequences & Series", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Permutations & Combinations", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Binomial Theorem", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Matrices & Determinants", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Trigonometry", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Coordinate Geometry — Straight Lines & Circles", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Conic Sections", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "Limits, Continuity & Differentiability", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "Applications of Derivatives", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "Indefinite & Definite Integration", estimatedHours: 5, priority: "HIGH", difficulty: "HARD" },
          { name: "Differential Equations", estimatedHours: 3, priority: "HIGH", difficulty: "HARD" },
          { name: "Vectors & 3D Geometry", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Probability & Statistics", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
        ],
      },
      {
        name: "Physics",
        color: "#2563EB",
        topics: [
          { name: "Units, Dimensions & Measurement", estimatedHours: 2, priority: "MEDIUM", difficulty: "EASY" },
          { name: "Kinematics", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Laws of Motion", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Work, Energy & Power", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Centre of Mass & Rotational Motion", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "Gravitation", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Elasticity, Fluids & SHM", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Waves & Sound", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Heat & Thermodynamics", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "Electrostatics", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "Current Electricity", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Magnetic Effects of Current", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "EMI & Alternating Current", estimatedHours: 3, priority: "HIGH", difficulty: "HARD" },
          { name: "Optics — Ray & Wave", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Modern Physics — Photoelectric, Nucleus, Semiconductors", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
        ],
      },
      {
        name: "Chemistry",
        color: "#059669",
        topics: [
          { name: "Atomic Structure & Chemical Bonding", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "States of Matter & Thermodynamics", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Electrochemistry & Chemical Kinetics", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "Equilibrium — Chemical & Ionic", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "s-Block & p-Block Elements", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "d & f Block Elements & Coordination Chemistry", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "General Organic Chemistry & Hydrocarbons", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Organic Reactions — Haloalkanes, Alcohols, Aldehydes", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "Biomolecules & Polymers", estimatedHours: 2, priority: "MEDIUM", difficulty: "EASY" },
          { name: "Practical Chemistry & Environmental", estimatedHours: 2, priority: "LOW", difficulty: "EASY" },
        ],
      },
    ],
  },

  // ── NEET ──────────────────────────────────────────────────────────────────
  {
    slug: "NEET",
    label: "NEET",
    description: "NEET UG — Physics, Chemistry, Botany, Zoology",
    icon: "🩺",
    subjects: [
      {
        name: "Physics",
        color: "#2563EB",
        topics: [
          { name: "Physical World & Measurement", estimatedHours: 2, priority: "LOW", difficulty: "EASY" },
          { name: "Kinematics & Laws of Motion", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Work, Energy & Rotational Motion", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Gravitation, Properties of Matter & Fluids", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Thermodynamics & Kinetic Theory", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Oscillations & Waves", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Electrostatics & Current Electricity", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "Magnetic Effects & Electromagnetic Induction", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Optics — Ray & Wave", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Modern Physics & Semiconductors", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
        ],
      },
      {
        name: "Chemistry",
        color: "#D97706",
        topics: [
          { name: "Basic Concepts & Atomic Structure", estimatedHours: 3, priority: "HIGH", difficulty: "EASY" },
          { name: "Chemical Bonding & Molecular Structure", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "States of Matter, Thermodynamics & Equilibrium", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Redox, Hydrogen, s-Block & p-Block", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Organic Chemistry — Basics & Hydrocarbons", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Solutions, Electrochemistry & Chemical Kinetics", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "Haloalkanes, Alcohols, Aldehydes & Acids", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "Amines, Biomolecules, Polymers & Chemistry in Everyday Life", estimatedHours: 3, priority: "MEDIUM", difficulty: "EASY" },
        ],
      },
      {
        name: "Botany",
        color: "#059669",
        topics: [
          { name: "Biological Classification & Plant Kingdom", estimatedHours: 3, priority: "HIGH", difficulty: "EASY" },
          { name: "Morphology & Anatomy of Flowering Plants", estimatedHours: 3, priority: "HIGH", difficulty: "EASY" },
          { name: "Cell Biology — Structure & Functions", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Biomolecules & Cell Cycle", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Plant Physiology — Transport, Mineral Nutrition", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Photosynthesis & Respiration", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Principles of Inheritance & Variation", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "Molecular Basis of Inheritance", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "Organisms & Populations, Ecosystem, Biodiversity", estimatedHours: 3, priority: "HIGH", difficulty: "EASY" },
          { name: "Reproduction in Flowering Plants", estimatedHours: 3, priority: "HIGH", difficulty: "EASY" },
        ],
      },
      {
        name: "Zoology",
        color: "#DC2626",
        topics: [
          { name: "Animal Kingdom Classification", estimatedHours: 3, priority: "HIGH", difficulty: "EASY" },
          { name: "Structural Organisation in Animals", estimatedHours: 2, priority: "MEDIUM", difficulty: "EASY" },
          { name: "Human Physiology — Digestion & Breathing", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Human Physiology — Circulation & Excretion", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Locomotion & Neural Control", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Chemical Coordination — Endocrine System", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Human Reproduction & Reproductive Health", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Evolution", estimatedHours: 2, priority: "MEDIUM", difficulty: "EASY" },
          { name: "Human Health & Disease", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Microbes, Biotechnology & Strategies for Enhancement", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
        ],
      },
    ],
  },

  // ── UPSC ──────────────────────────────────────────────────────────────────
  {
    slug: "UPSC",
    label: "UPSC CSE Prelims",
    description: "UPSC CSE Prelims — GS Paper I & CSAT",
    icon: "🏛️",
    subjects: [
      {
        name: "History",
        color: "#D97706",
        topics: [
          { name: "Ancient Indian History", estimatedHours: 5, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Medieval Indian History", estimatedHours: 5, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Modern Indian History — 1857 to Independence", estimatedHours: 6, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Indian National Movement", estimatedHours: 5, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "World History & Post-Independence India", estimatedHours: 4, priority: "MEDIUM", difficulty: "MEDIUM" },
          { name: "Art, Culture & Heritage", estimatedHours: 5, priority: "HIGH", difficulty: "MEDIUM" },
        ],
      },
      {
        name: "Geography",
        color: "#059669",
        topics: [
          { name: "Physical Geography — Geomorphology", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Physical Geography — Climatology & Oceanography", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Indian Geography — Physical", estimatedHours: 5, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Indian Geography — Human & Economic", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "World Geography", estimatedHours: 3, priority: "MEDIUM", difficulty: "MEDIUM" },
          { name: "Disaster Management", estimatedHours: 2, priority: "MEDIUM", difficulty: "EASY" },
        ],
      },
      {
        name: "Indian Polity",
        color: "#7C3AED",
        topics: [
          { name: "Constitution — Historical Background & Features", estimatedHours: 3, priority: "HIGH", difficulty: "EASY" },
          { name: "Fundamental Rights, DPSP & Duties", estimatedHours: 3, priority: "HIGH", difficulty: "EASY" },
          { name: "Parliament, President & Union Executive", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Judiciary — Supreme Court & High Courts", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "State Governments & Local Bodies", estimatedHours: 3, priority: "HIGH", difficulty: "EASY" },
          { name: "Constitutional Bodies — Election Commission, CAG, UPSC", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Governance & Social Justice", estimatedHours: 3, priority: "MEDIUM", difficulty: "MEDIUM" },
        ],
      },
      {
        name: "Economics",
        color: "#2563EB",
        topics: [
          { name: "Indian Economy Overview & Planning", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Agriculture & Rural Development", estimatedHours: 3, priority: "HIGH", difficulty: "EASY" },
          { name: "Industry, Infrastructure & Services", estimatedHours: 3, priority: "MEDIUM", difficulty: "MEDIUM" },
          { name: "Money, Banking & Monetary Policy", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Fiscal Policy, Budget & Taxation", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "International Trade & Economic Organisations", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Poverty, Employment & Human Development", estimatedHours: 3, priority: "MEDIUM", difficulty: "EASY" },
        ],
      },
      {
        name: "Environment & Ecology",
        color: "#059669",
        topics: [
          { name: "Ecology & Ecosystems", estimatedHours: 3, priority: "HIGH", difficulty: "EASY" },
          { name: "Biodiversity — Conservation & Hotspots", estimatedHours: 3, priority: "HIGH", difficulty: "EASY" },
          { name: "Environmental Pollution & Climate Change", estimatedHours: 3, priority: "HIGH", difficulty: "EASY" },
          { name: "Environmental Laws & Conventions", estimatedHours: 2, priority: "HIGH", difficulty: "EASY" },
        ],
      },
      {
        name: "Science & Technology",
        color: "#DC2626",
        topics: [
          { name: "Space Technology — ISRO Missions", estimatedHours: 2, priority: "HIGH", difficulty: "EASY" },
          { name: "Defence & Nuclear Technology", estimatedHours: 2, priority: "MEDIUM", difficulty: "EASY" },
          { name: "Biotechnology & Health", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "IT, AI & Emerging Technologies", estimatedHours: 2, priority: "HIGH", difficulty: "EASY" },
        ],
      },
      {
        name: "Current Affairs",
        color: "#0891B2",
        topics: [
          { name: "National Issues & Government Schemes", estimatedHours: 8, priority: "HIGH", difficulty: "EASY" },
          { name: "International Affairs & Bilateral Relations", estimatedHours: 5, priority: "HIGH", difficulty: "EASY" },
          { name: "Economy in News", estimatedHours: 4, priority: "HIGH", difficulty: "EASY" },
          { name: "Science & Tech in News", estimatedHours: 3, priority: "HIGH", difficulty: "EASY" },
        ],
      },
      {
        name: "CSAT",
        color: "#DB2777",
        topics: [
          { name: "Reading Comprehension", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Logical Reasoning & Analytical Ability", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "Basic Numeracy & Data Interpretation", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Decision Making & Problem Solving", estimatedHours: 2, priority: "MEDIUM", difficulty: "MEDIUM" },
        ],
      },
    ],
  },

  // ── CAT ───────────────────────────────────────────────────────────────────
  {
    slug: "CAT",
    label: "CAT",
    description: "CAT — VARC, DILR, Quantitative Aptitude",
    icon: "📊",
    subjects: [
      {
        name: "Verbal Ability & Reading Comprehension",
        color: "#7C3AED",
        topics: [
          { name: "Reading Comprehension — Long Passages", estimatedHours: 6, priority: "HIGH", difficulty: "HARD" },
          { name: "Para Jumbles", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "Para Summary", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Odd Sentence Out", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Critical Reasoning", estimatedHours: 3, priority: "MEDIUM", difficulty: "HARD" },
          { name: "Vocabulary in Context", estimatedHours: 2, priority: "MEDIUM", difficulty: "MEDIUM" },
        ],
      },
      {
        name: "Data Interpretation & Logical Reasoning",
        color: "#2563EB",
        topics: [
          { name: "Tables & Bar Charts", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Line Graphs & Pie Charts", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Caselets — Textual DI", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "Arrangements — Linear & Circular", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "Grid & Network Puzzles", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "Scheduling & Grouping", estimatedHours: 3, priority: "HIGH", difficulty: "HARD" },
          { name: "Syllogisms & Venn Diagrams", estimatedHours: 2, priority: "MEDIUM", difficulty: "MEDIUM" },
        ],
      },
      {
        name: "Quantitative Aptitude",
        color: "#059669",
        topics: [
          { name: "Number Systems", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Arithmetic — Percentages, Profit & Loss, Ratio", estimatedHours: 5, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Time, Speed, Distance & Work", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Algebra — Linear & Quadratic Equations", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Geometry & Mensuration", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "Trigonometry", estimatedHours: 2, priority: "MEDIUM", difficulty: "MEDIUM" },
          { name: "Modern Mathematics — P&C, Probability", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "Progressions, Series & Functions", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
        ],
      },
    ],
  },

  // ── Placements ────────────────────────────────────────────────────────────
  {
    slug: "PLACEMENTS",
    label: "Placements",
    description: "SWE placements — DSA, CS fundamentals, system design",
    icon: "💼",
    subjects: [
      {
        name: "DSA (LeetCode-style)",
        color: "#7C3AED",
        topics: [
          { name: "Arrays, Hashing & Two Pointers", estimatedHours: 5, priority: "HIGH", difficulty: "EASY" },
          { name: "Sliding Window & Prefix Sums", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Stacks & Queues", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Binary Search", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Linked Lists", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Trees — Binary Trees & BSTs", estimatedHours: 5, priority: "HIGH", difficulty: "HARD" },
          { name: "Heaps & Priority Queues", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Graphs — BFS, DFS, Union-Find", estimatedHours: 5, priority: "HIGH", difficulty: "HARD" },
          { name: "Dynamic Programming", estimatedHours: 7, priority: "HIGH", difficulty: "HARD" },
          { name: "Backtracking", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "Greedy", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Bit Manipulation", estimatedHours: 2, priority: "MEDIUM", difficulty: "MEDIUM" },
          { name: "Trie & Advanced Data Structures", estimatedHours: 3, priority: "MEDIUM", difficulty: "HARD" },
        ],
      },
      {
        name: "Operating Systems",
        color: "#2563EB",
        topics: [
          { name: "Processes, Threads & Scheduling", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Synchronisation & Deadlocks", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Memory Management & Virtual Memory", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "File Systems & I/O", estimatedHours: 2, priority: "MEDIUM", difficulty: "EASY" },
        ],
      },
      {
        name: "Computer Networks",
        color: "#059669",
        topics: [
          { name: "TCP/IP, DNS & HTTP/HTTPS", estimatedHours: 2, priority: "HIGH", difficulty: "EASY" },
          { name: "REST & gRPC Basics", estimatedHours: 2, priority: "HIGH", difficulty: "EASY" },
          { name: "WebSockets & Long Polling", estimatedHours: 1, priority: "MEDIUM", difficulty: "EASY" },
          { name: "CDN, Load Balancing & Proxies", estimatedHours: 2, priority: "HIGH", difficulty: "MEDIUM" },
        ],
      },
      {
        name: "DBMS & SQL",
        color: "#D97706",
        topics: [
          { name: "Relational Model, Keys & Joins", estimatedHours: 3, priority: "HIGH", difficulty: "EASY" },
          { name: "Normalisation", estimatedHours: 2, priority: "MEDIUM", difficulty: "MEDIUM" },
          { name: "Transactions & ACID", estimatedHours: 2, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Indexing & Query Optimisation", estimatedHours: 2, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "NoSQL Basics — Redis, MongoDB", estimatedHours: 2, priority: "MEDIUM", difficulty: "EASY" },
        ],
      },
      {
        name: "System Design (LLD + HLD)",
        color: "#DC2626",
        topics: [
          { name: "OOP Principles & Design Patterns", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "LLD — Design Parking Lot, Elevator, Chess", estimatedHours: 4, priority: "HIGH", difficulty: "HARD" },
          { name: "Scalability Fundamentals — Horizontal & Vertical Scaling", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Caching Strategies", estimatedHours: 2, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Message Queues — Kafka, RabbitMQ", estimatedHours: 2, priority: "MEDIUM", difficulty: "MEDIUM" },
          { name: "HLD — Design URL Shortener, Twitter, YouTube", estimatedHours: 5, priority: "HIGH", difficulty: "HARD" },
          { name: "Database Design & Sharding", estimatedHours: 3, priority: "HIGH", difficulty: "HARD" },
        ],
      },
      {
        name: "Aptitude & Reasoning",
        color: "#0891B2",
        topics: [
          { name: "Quantitative Aptitude — Arithmetic", estimatedHours: 4, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Logical Reasoning", estimatedHours: 3, priority: "HIGH", difficulty: "MEDIUM" },
          { name: "Verbal Ability", estimatedHours: 2, priority: "MEDIUM", difficulty: "EASY" },
        ],
      },
    ],
  },
];

// ─── Seed logic ───────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱  Seeding exam catalog…");

  for (const exam of CATALOG) {
    // Compute totalHours from subjects
    const totalHours = exam.subjects.reduce(
      (sum, s) => sum + s.topics.reduce((t, topic) => t + topic.estimatedHours, 0),
      0
    );

    // Upsert the exam catalog entry
    const catalogExam = await prisma.examCatalog.upsert({
      where: { slug: exam.slug },
      update: {
        label: exam.label,
        description: exam.description,
        icon: exam.icon,
        totalHours,
        isActive: true,
      },
      create: {
        slug: exam.slug,
        label: exam.label,
        description: exam.description,
        icon: exam.icon,
        totalHours,
        isActive: true,
      },
    });

    // Remove old subjects (and their topics via cascade) then re-insert.
    // This is simpler than deep-diffing and ensures the seed is the source
    // of truth on every run.
    await prisma.catalogSubject.deleteMany({
      where: { examId: catalogExam.id },
    });

    for (let si = 0; si < exam.subjects.length; si++) {
      const sub = exam.subjects[si];

      const catalogSubject = await prisma.catalogSubject.create({
        data: {
          examId: catalogExam.id,
          name: sub.name,
          color: sub.color,
          order: si,
        },
      });

      if (sub.topics.length > 0) {
        await prisma.catalogTopic.createMany({
          data: sub.topics.map((t, ti) => ({
            subjectId: catalogSubject.id,
            name: t.name,
            order: ti,
            estimatedHours: t.estimatedHours,
            priority: t.priority,
            difficulty: t.difficulty,
          })),
        });
      }
    }

    const topicCount = exam.subjects.reduce((n, s) => n + s.topics.length, 0);
    console.log(
      `  ✓  ${exam.label.padEnd(20)} — ${exam.subjects.length} subjects, ${topicCount} topics, ~${totalHours}h`
    );
  }

  console.log("\n✅  Catalog seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
