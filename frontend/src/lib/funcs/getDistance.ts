export function getDistance(x0: number, y0: number, x1: number, y1: number) {
    if (x0 === 0 && y0 === 0 && x1 === 0 && y1 === 0) {
        return 0
    }

    const xSqrt = Math.pow(x1 - x0, 2)
    const ySqrt = Math.pow(y1 - y1, 2)


    if (xSqrt === 0 && ySqrt === 0) {
        return 0
    }

    return Math.sqrt(xSqrt + ySqrt)
}

