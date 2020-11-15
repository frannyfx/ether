export function lerp(a: number, b: number, t: number) {
    return a * (1 - t) + b * t;
}

export function clamp(v: number, min: number, max: number) {
    if (v < min) return min;
    if (v > max) return max;
    return v;
}