class FPS {
	constructor(selector) {
		this.container = document.querySelector(selector)
		this.frames = []
		this.lasteFrameTimeStamp = performance.now()
	}

	render() {
		let now = performance.now()
		let detal = now - this.lasteFrameTimeStamp
		this.lasteFrameTimeStamp = now
		const fps = (1 / detal) * 1000
		this.frames.push(fps)
		if (this.frames.length > 100) {
			this.frames.shift()
		}

		let sum = 0
		let min = Infinity
		let max = -Infinity
		for (let i = 0; i < this.frames.length; i++) {
			min = Math.min(this.frames[i], min)
			max = Math.max(this.frames[i], max)
			sum += this.frames[i]
		}
		const mean = sum / this.frames.length

		this.container.textContent = `
Frames per Second:
         latest = ${Math.round(fps)}
avg of last 100 = ${Math.round(mean)}
min of last 100 = ${Math.round(min)}
max of last 100 = ${Math.round(max)}
`.trim()
	}
}

export default FPS
