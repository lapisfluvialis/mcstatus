export function set_diff<T>(set_a: Set<T>, set_b: Set<T>): Set<T> {
    const diff = new Set(set_a)
    for (const e of set_b) {
        diff.delete(e)
    }
    return diff
}
