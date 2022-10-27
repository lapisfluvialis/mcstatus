export function set_diff(set_a, set_b) {
    const diff = new Set(set_a);
    for (const e of set_b) {
        diff.delete(e);
    }
    return diff;
}
