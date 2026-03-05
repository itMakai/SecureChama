"use client";

type NetworkEdge = {
  guarantor__user__name: string;
  loan__member__user__name: string;
  guaranteed_amount: string;
};

type Node = {
  id: string;
  label: string;
  x: number;
  y: number;
  type: "guarantor" | "borrower";
};

export default function GuarantorNetworkGraph({ data }: { data: NetworkEdge[] }) {
  const trimmed = data.slice(0, 24);

  const guarantors = Array.from(new Set(trimmed.map((item) => item.guarantor__user__name)));
  const borrowers = Array.from(new Set(trimmed.map((item) => item.loan__member__user__name)));

  const width = 900;
  const height = 360;

  const leftNodes: Node[] = guarantors.map((name, index) => ({
    id: `g:${name}`,
    label: name,
    x: 180,
    y: ((index + 1) * height) / (guarantors.length + 1),
    type: "guarantor",
  }));
  const rightNodes: Node[] = borrowers.map((name, index) => ({
    id: `b:${name}`,
    label: name,
    x: 720,
    y: ((index + 1) * height) / (borrowers.length + 1),
    type: "borrower",
  }));
  const allNodes = [...leftNodes, ...rightNodes];
  const nodeMap = new Map(allNodes.map((node) => [node.id, node]));

  return (
    <div className="surface-card rounded-2xl p-6">
      <h2 className="fin-heading mb-4 text-lg font-bold">Guarantor Network Graph</h2>
      <div className="overflow-x-auto rounded-xl border border-[#d4e3ef] bg-[#f7fbff]">
        <svg width={width} height={height} role="img" aria-label="Guarantor network graph">
          {trimmed.map((edge, index) => {
            const from = nodeMap.get(`g:${edge.guarantor__user__name}`);
            const to = nodeMap.get(`b:${edge.loan__member__user__name}`);
            if (!from || !to) return null;
            const strokeWidth = Math.max(1, Math.min(7, Number(edge.guaranteed_amount) / 15000));
            return (
              <line
                key={`${from.id}-${to.id}-${index}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="#7ca6c4"
                strokeWidth={strokeWidth}
                strokeOpacity={0.7}
              />
            );
          })}

          {allNodes.map((node) => (
            <g key={node.id}>
              <circle cx={node.x} cy={node.y} r={8} fill={node.type === "guarantor" ? "#0f766e" : "#0b2748"} />
              <text x={node.x + (node.type === "guarantor" ? -12 : 12)} y={node.y + 4} fontSize="11" textAnchor={node.type === "guarantor" ? "end" : "start"} fill="#0f2340">
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <p className="fin-muted mt-3 text-xs">
        Left nodes are guarantors, right nodes are borrowers. Thicker links indicate higher guaranteed amount.
      </p>
    </div>
  );
}
