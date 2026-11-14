"use client";

import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  CSSProperties,
  ReactNode,
} from "react";
import gsap from "gsap";

const DEG = 90 / Math.PI;
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

/**
 * Slot mask that punches a rounded hole at the top of the card.
 */
const slotMask = (
  w: number,
  h: number,
  r: number,
  y: number,
  bleed = 0
): CSSProperties => {
  const box: CSSProperties = bleed
    ? { padding: bleed, top: -bleed, left: -bleed }
    : {};
  if (!w || !h) return box;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${Math.min(
    r,
    h / 2,
    w / 2
  )}" fill="#000"/></svg>`;
  const slot = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  const image = `linear-gradient(#000,#000), ${slot}`;
  const size = `100% 100%, ${w}px ${h}px`;
  const position = `0 0, 50% ${y + bleed}px`;
  const repeat = "no-repeat, no-repeat";
  return {
    WebkitMaskImage: image,
    maskImage: image,
    WebkitMaskSize: size,
    maskSize: size,
    WebkitMaskPosition: position,
    maskPosition: position,
    WebkitMaskRepeat: repeat,
    maskRepeat: repeat,
    WebkitMaskComposite: "xor",
    maskComposite: "exclude",
    WebkitMaskClip: "no-clip",
    maskClip: "no-clip",
    ...box,
  } as CSSProperties;
};

/** Split clasp image vertically: keep left half or right half */
const vSplitMask = (atPct: number, keepLeft: boolean): CSSProperties => {
  const g = keepLeft
    ? `linear-gradient(to right, #000 ${atPct}%, transparent ${atPct}%)`
    : `linear-gradient(to right, transparent ${atPct}%, #000 ${atPct}%)`;
  return { WebkitMaskImage: g, maskImage: g } as CSSProperties;
};

interface SlabProps {
  thickness: number;
  layers: number;
  color: string;
  radius: number;
  shade: number;
  mask: CSSProperties;
  maskContent: CSSProperties;
  onReady?: () => void;
  children: ReactNode;
}

function Slab({
  thickness,
  layers,
  color,
  radius,
  shade,
  mask,
  maskContent,
  onReady,
  children,
}: SlabProps) {
  const n = Math.max(1, Math.round(layers));
  const innerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useLayoutEffect(() => {
    const el = innerRef.current?.firstElementChild as HTMLElement | null;
    if (!el) {
      onReady?.();
      return;
    }
    const update = () => {
      setSize({ w: el.offsetWidth, h: el.offsetHeight });
      if (el.offsetWidth && el.offsetHeight) onReady?.();
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [children, onReady]);

  const wrap: CSSProperties = {
    position: "relative",
    width: size?.w,
    height: size?.h,
    transformStyle: "preserve-3d",
    overflow: "visible",
  };

  const content = (
    <div
      ref={innerRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        overflow: "visible",
        ...maskContent,
      }}
    >
      {children}
    </div>
  );

  if (thickness <= 0) return <div style={wrap}>{content}</div>;
  return (
    <div style={wrap}>
      {Array.from({ length: n }, (_, i) => {
        const t = (i + 1) / n;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: radius,
              background: color,
              filter: `brightness(${1 - shade * t})`,
              transform: `translateZ(${-thickness * t}px)`,
              backfaceVisibility: "hidden",
              pointerEvents: "none",
              ...mask,
            }}
          />
        );
      })}
      {content}
    </div>
  );
}

export interface LanyardBadgeProps {
  strap?: { src?: string; alt?: string };
  clasp?: { src?: string; alt?: string };
  card?: ReactNode[];
  layout?: {
    baseHeight: number;
    fitWidth: boolean;
    strapH: number;
    strapOffset: number;
    strapW: number;
    claspH: number;
    claspY: number;
    cardY: number;
    cardPivot: number;
    fadeIn: number;
  };
  drive?: {
    shiftX: number;
    stiffness: number;
    damping: number;
    transfer: number;
  };
  physics?: {
    gravity: number;
    strapLength: number;
    strapDamping: number;
    strapDrive: number;
    strapMax: number;
    cardLength: number;
    cardDamping: number;
    cardMax: number;
    bounce: number;
    tilt3D: number;
    maxTilt: number;
    perspective: number;
  };
  depth?: {
    thickness: number;
    layers: number;
    color: string;
    shade: number;
    radius: number;
    sway: number;
    swayDrive: number;
    swayRatio: number;
    swayDamp: number;
  };
  slot?: {
    enabled: boolean;
    width: number;
    height: number;
    radius: number;
    offsetY: number;
    bleed: number;
  };
  hook?: {
    enabled: boolean;
    splitX: number;
  };
  intro?: {
    enabled: boolean;
    drop: number;
    delay: number;
    gravity: number;
    stiffness: number;
    damping: number;
    cordStiffness: number;
    cordDamping: number;
    cordTransfer: number;
    cordMax: number;
    tilt: number;
    kick: number;
    kickStrap: number;
  };
  style?: CSSProperties;
}

export const defaultLanyardProps = {
  layout: {
    baseHeight: 700,
    fitWidth: true,
    strapH: 31,
    strapOffset: 0,
    strapW: 0,
    claspH: 16,
    claspY: -4,
    cardY: -6.5,
    cardPivot: 50,
    fadeIn: 0.35,
  },
  drive: { shiftX: 90, stiffness: 90, damping: 14, transfer: 1 },
  physics: {
    gravity: 2600,
    strapLength: 620,
    strapDamping: 2.2,
    strapDrive: 0.55,
    strapMax: 18,
    cardLength: 190,
    cardDamping: 1.15,
    cardMax: 62,
    bounce: 0.35,
    tilt3D: 5,
    maxTilt: 16,
    perspective: 1600,
  },
  depth: {
    thickness: 10,
    layers: 6,
    color: "#E4E4E4",
    shade: 0.28,
    radius: 12,
    sway: 40,
    swayDrive: 0.7,
    swayRatio: 1.5,
    swayDamp: 0.7,
  },
  slot: {
    enabled: true,
    width: 160,
    height: 22,
    radius: 11,
    offsetY: 24,
    bleed: 240,
  },
  hook: {
    enabled: true,
    splitX: 50,
  },
  intro: {
    enabled: true,
    drop: 600,
    delay: 0.1,
    gravity: 3000,
    stiffness: 1200,
    damping: 26,
    cordStiffness: 900,
    cordDamping: 18,
    cordTransfer: 0.5,
    cordMax: 120,
    tilt: 14,
    kick: -150,
    kickStrap: 0.2,
  },
};

export default function LanyardBadge(props: LanyardBadgeProps) {
  const layout = useMemo(
    () => ({ ...defaultLanyardProps.layout, ...props.layout }),
    [props.layout]
  );
  const drive = useMemo(
    () => ({ ...defaultLanyardProps.drive, ...props.drive }),
    [props.drive]
  );
  const physics = useMemo(
    () => ({ ...defaultLanyardProps.physics, ...props.physics }),
    [props.physics]
  );
  const depth = useMemo(
    () => ({ ...defaultLanyardProps.depth, ...props.depth }),
    [props.depth]
  );
  const slot = useMemo(
    () => ({ ...defaultLanyardProps.slot, ...props.slot }),
    [props.slot]
  );
  const hook = useMemo(
    () => ({ ...defaultLanyardProps.hook, ...props.hook }),
    [props.hook]
  );
  const intro = useMemo(
    () => ({ ...defaultLanyardProps.intro, ...props.intro }),
    [props.intro]
  );
  const { strap, clasp, card, style } = props;

  const {
    baseHeight,
    fitWidth,
    strapH,
    strapOffset,
    strapW,
    claspH,
    claspY,
    cardY,
    cardPivot,
  } = layout;

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const strapLinkRef = useRef<HTMLDivElement>(null);
  const cardLinkRef = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useState(1);
  const [scaleReady, setScaleReady] = useState(false);
  const [imgsReady, setImgsReady] = useState(() => !props.strap?.src && !props.clasp?.src);
  const [slabReady, setSlabReady] = useState(false);
  const [strapAspect, setStrapAspect] = useState(0);
  const onSlabReady = useCallback(() => setSlabReady(true), []);
  const ready = scaleReady && imgsReady && slabReady;
  const pct = (v: number) => (v / 100) * baseHeight;

  /* Preload Images */
  useEffect(() => {
    const items = [
      { src: strap?.src, isStrap: true },
      { src: clasp?.src, isStrap: false },
    ].filter((i) => i.src) as { src: string; isStrap: boolean }[];
    if (!items.length) {
      return;
    }
    let done = 0;
    let cancelled = false;
    const bump = () => {
      if (!cancelled && ++done >= items.length) setImgsReady(true);
    };
    items.forEach(({ src, isStrap }) => {
      const im = new Image();
      im.onload = () => {
        if (isStrap && im.naturalHeight && !cancelled)
          setStrapAspect(im.naturalWidth / im.naturalHeight);
        bump();
      };
      im.onerror = bump;
      im.src = src;
    });
    return () => {
      cancelled = true;
    };
  }, [strap?.src, clasp?.src]);

  /* Responsive measure */
  useLayoutEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;
    const measure = () => {
      const h = root.clientHeight;
      if (!h) return;
      let s = h / baseHeight;
      if (fitWidth) {
        const w = stage.offsetWidth;
        if (w) s = Math.min(s, root.clientWidth / w);
      }
      setScale(s);
      setScaleReady(true);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => ro.disconnect();
  }, [baseHeight, fitWidth, strapH, strapOffset, claspH, claspY, cardY]);

  /* Physics Loop */
  useEffect(() => {
    if (!ready) return;
    const root = rootRef.current;
    const anchor = anchorRef.current;
    if (!root || !anchor) return;

    let sAng = 0;
    let sVel = intro.enabled ? (intro.kick * intro.kickStrap) / DEG : 0;
    let cAng = intro.enabled ? intro.tilt / DEG : 0;
    let cVel = intro.enabled ? intro.kick / DEG : 0;
    let zAng = 0;
    let zVel = 0;
    let target = 0;
    let pos = 0;
    let vel = 0;

    let posY = intro.enabled ? -intro.drop : 0;
    let velY = 0;
    let accY = 0;
    let landed = !intro.enabled;
    let wait = intro.enabled ? intro.delay : 0;

    let cordY = 0;
    let cordVel = 0;

    const STEP = 1 / 240;
    let carry = 0;

    const integrate = (h: number) => {
      /* Vertical axis */
      if (wait > 0) {
        wait -= h;
      } else {
        const prevVelY = velY;
        if (!landed) {
          velY += intro.gravity * h;
          posY += velY * h;
          if (posY >= 0) landed = true;
        } else {
          velY += ((0 - posY) * intro.stiffness - velY * intro.damping) * h;
          posY += velY * h;
        }
        accY = (velY - prevVelY) / h;
      }

      const cordAcc =
        -accY * intro.cordTransfer -
        intro.cordStiffness * cordY -
        intro.cordDamping * cordVel;
      cordVel += cordAcc * h;
      cordY = clamp(cordY + cordVel * h, -intro.cordMax, intro.cordMax);

      /* Horizontal axis */
      const a = (target - pos) * drive.stiffness - vel * drive.damping;
      vel += a * h;
      pos += vel * h;

      // Strap
      const sa =
        -(physics.gravity / physics.strapLength) * Math.sin(sAng) -
        ((a * physics.strapDrive * drive.transfer) / physics.strapLength) *
          Math.cos(sAng) -
        physics.strapDamping * sVel;
      sVel += sa * h;
      sAng += sVel * h;
      const sMax = physics.strapMax / DEG;
      sAng = clamp(sAng, -sMax, sMax);

      // Card tilt
      const ca =
        -(physics.gravity / physics.cardLength) * Math.sin(cAng) -
        ((a * drive.transfer) / physics.cardLength) * Math.cos(cAng) -
        physics.cardDamping * cVel;
      cVel += ca * h;
      cAng += cVel * h;
      const cMax = physics.cardMax / DEG;
      if (cAng > cMax) {
        cAng = cMax;
        cVel *= -physics.bounce;
      } else if (cAng < -cMax) {
        cAng = -cMax;
        cVel *= -physics.bounce;
      }

      // Card Z sway
      if (depth.sway > 0) {
        const zL = physics.cardLength * depth.swayRatio;
        const za =
          -(physics.gravity / zL) * Math.sin(zAng) -
          ((a * depth.swayDrive * drive.transfer) / zL) * Math.cos(zAng) -
          physics.cardDamping * depth.swayDamp * zVel;
        zVel += za * h;
        zAng += zVel * h;
        zAng = clamp(zAng, -1.2, 1.2);
      }
    };

    const render = () => {
      anchor.style.transform = `translate3d(${pos}px,${posY}px,0)`;

      if (strapLinkRef.current)
        strapLinkRef.current.style.transform = `rotate(${sAng * DEG}deg)`;

      if (cardLinkRef.current) {
        const y = clamp(cVel * physics.tilt3D, -physics.maxTilt, physics.maxTilt);
        const z = depth.sway * Math.sin(zAng);
        cardLinkRef.current.style.transform = `perspective(${physics.perspective}px) translateY(${cordY}px) translateZ(${z}px) rotate(${cAng * DEG}deg) rotateY(${y}deg)`;
      }
    };

    const tick = (_t: number, dt: number) => {
      carry += Math.min(dt, 50) / 1000;
      while (carry >= STEP) {
        integrate(STEP);
        carry -= STEP;
      }
      render();
    };

    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      target = clamp(nx, -1, 1) * drive.shiftX;
    };
    const onLeave = () => {
      target = 0;
    };

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("pointercancel", onLeave);
    render();
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("pointercancel", onLeave);
    };
  }, [drive, physics, depth, intro, ready]);

  const cardMask = useMemo(
    () =>
      slot.enabled
        ? slotMask(slot.width, slot.height, slot.radius, slot.offsetY)
        : {},
    [slot.enabled, slot.width, slot.height, slot.radius, slot.offsetY]
  );

  const cardMaskContent = useMemo(
    () =>
      slot.enabled
        ? slotMask(
            slot.width,
            slot.height,
            slot.radius,
            slot.offsetY,
            slot.bleed
          )
        : { padding: slot.bleed, top: -slot.bleed, left: -slot.bleed },
    [
      slot.enabled,
      slot.width,
      slot.height,
      slot.radius,
      slot.offsetY,
      slot.bleed,
    ]
  );

  const strapWidth = strapW > 0 ? pct(strapW) : pct(strapH) * strapAspect;

  const renderImg = (src?: { src?: string; alt?: string }, h = 0, extra: CSSProperties = {}) =>
    src?.src ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src.src}
        alt={src.alt ?? ""}
        draggable={false}
        style={{
          height: h,
          width: "auto",
          objectFit: "contain",
          display: "block",
          pointerEvents: "none",
          ...extra,
        }}
      />
    ) : null;

  return (
    <div
      ref={rootRef}
      style={{ ...style, position: "relative", overflow: "visible" }}
    >
      <div
        ref={stageRef}
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          height: baseHeight,
          transform: `translateX(-50%) scale(${scale})`,
          transformOrigin: "50% 0%",
          overflow: "visible",
          opacity: ready ? 1 : 0,
          transition: `opacity ${layout.fadeIn}s ease`,
          pointerEvents: ready ? undefined : "none",
        }}
      >
        <div
          ref={anchorRef}
          style={{ overflow: "visible", willChange: "transform" }}
        >
          <div
            ref={strapLinkRef}
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              transformOrigin: "50% 0%",
              overflow: "visible",
              willChange: "transform",
            }}
          >
            {/* z1 — Left half clasp, behind card */}
            {hook.enabled && (
              <div
                style={{
                  position: "absolute",
                  top: pct(strapH) + pct(claspY),
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 1,
                  pointerEvents: "none",
                }}
              >
                {renderImg(
                  clasp,
                  pct(claspH),
                  vSplitMask(hook.splitX, true)
                )}
              </div>
            )}

            {/* z3 — Strap + Right half clasp */}
            <div
              style={{
                position: "relative",
                zIndex: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                pointerEvents: "none",
              }}
            >
              {renderImg(strap, pct(strapH) + pct(strapOffset), {
                width: strapWidth || "auto",
                objectFit: strapWidth ? "fill" : "contain",
                marginTop: -pct(strapOffset),
              })}
              {renderImg(clasp, pct(claspH), {
                marginTop: pct(claspY),
                ...(hook.enabled ? vSplitMask(hook.splitX, false) : {}),
              })}
            </div>

            {/* z2 — CARD */}
            <div
              ref={cardLinkRef}
              style={{
                position: "relative",
                zIndex: 2,
                marginTop: pct(cardY),
                transformOrigin: `${cardPivot}% 0%`,
                transformStyle: "preserve-3d",
                overflow: "visible",
                willChange: "transform",
              }}
            >
              <Slab
                thickness={depth.thickness}
                layers={depth.layers}
                color={depth.color}
                radius={depth.radius}
                shade={depth.shade}
                mask={cardMask}
                maskContent={cardMaskContent}
                onReady={onSlabReady}
              >
                {card?.[0]}
              </Slab>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

LanyardBadge.defaultProps = defaultLanyardProps;
