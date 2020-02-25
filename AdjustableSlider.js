class AdjustableSlider extends HTMLElement {
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		const self = this;

		shadow.innerHTML = `
			<style>
				:host {
					display: block;
					height: 100%;
					width: 100%;
				}
			</style>
			<div id="touchContainer" style="position: absolute; top: 0; left: 0; z-index: 3; width: 100%; height: 100%; background-color: rgba(255, 0, 0, 0.2); width: 100%; height: 100%;" />
			<div id="coverContainer" style="position: absolute; top: 0; left: 0; z-index: 2;">
				<slot name="cover" />
			</div>
			<div id="topContainer" style="position: absolute; top: 0; left: 0; z-index: 1; clip: auto; width: 100%; height: 100%;">
				<slot name="top" />
			</div>
			<div id="bottomContainer" style="position: absolute; top: 0; left: 0; z-index: 0; width: 100%; height: 100%; ">
				<slot name="bottom" />
			</div>`;

		self.elements = {
			coverContainer: shadow.querySelector('#coverContainer'),
			topContainer: shadow.querySelector('#topContainer'),
			bottomContainer: shadow.querySelector('#bottomContainer'),
			touchContainer: shadow.querySelector('#touchContainer'),
		};

		self.elements.touchContainer.addEventListener('mousedown', mouseHandler, false);
		self.elements.touchContainer.addEventListener('mousemove', mouseHandler, false);
		window.addEventListener('mouseup', mouseHandler, false);
		self.elements.touchContainer.addEventListener('touchstart', touchHandler, false);
		self.elements.touchContainer.addEventListener('touchmove', touchHandler, false);
		self.elements.touchContainer.addEventListener('touchend', touchHandler, false);

		function mouseHandler(event) {
			event.stopPropagation();
			event.preventDefault();

			const canvasBoundingClientRect = self.elements.touchContainer.getBoundingClientRect();
			const eventPercentageX = (event.clientX - canvasBoundingClientRect.left) / canvasBoundingClientRect.width;
			const eventPercentageY = (event.clientY - canvasBoundingClientRect.top) / canvasBoundingClientRect.height;

			switch(event.type) {
				case 'mousedown':
					self.mousedown = true;
					self.setPosition(eventPercentageX, eventPercentageY);
					break;
				case 'mousemove':
					if(typeof self.mousedown === 'boolean' && self.mousedown)
						self.setPosition(eventPercentageX, eventPercentageY);
					break;
				case 'mouseup':
					if(self.mousedown) {
						self.mousedown = false;
						self.setPosition(eventPercentageX, eventPercentageY);
					}
					break;
			}
		}

		function touchHandler(event) {
			event.stopPropagation();
			event.preventDefault();
			const canvasBoundingClientRect = self.elements.touchContainer.getBoundingClientRect();

			for(let touchKey in event.changedTouches) {
				if(event.changedTouches.hasOwnProperty(touchKey)) {
					const touch = event.changedTouches[touchKey];
					const eventPercentageX = (touch.clientX - canvasBoundingClientRect.left) / canvasBoundingClientRect.width;
					const eventPercentageY = (touch.clientY - canvasBoundingClientRect.top) / canvasBoundingClientRect.height;
					self.setPosition(eventPercentageX, eventPercentageY);
				}
			}
		}
	}

	setPosition(percentageX, percentageY) {
		const percentageXSanitized = Math.min(1, Math.max(0, percentageX));
		const percentageYSanitized = Math.min(1, Math.max(0, percentageY));

		switch(this.from) {
			case 'left':
				this.cover(percentageXSanitized);
				break;
			case 'right':
				this.cover(1 - percentageXSanitized);
				break;
			case 'top':
				this.cover(percentageYSanitized);
				break;
			case 'bottom':
				this.cover(1 - percentageYSanitized);
				break;
		}
	}

	cover(covered = this.covered, from = this.from, mirrorTag = undefined) {
		if(covered !== undefined && from !== undefined) {
			if(covered !== this.covered)
				this.covered = covered;

			if(from !== this.from)
				this.from = from;

			const topContainerBoundingClientRect = this.elements.topContainer.getBoundingClientRect();

			const clipRectTop = (from === 'bottom') ? Math.round(topContainerBoundingClientRect.height * (1 - covered)) : 0;
			const clipRectRight = (from === 'left') ? Math.round(topContainerBoundingClientRect.width * covered) : topContainerBoundingClientRect.width;
			const clipRectBottom = (from === 'top') ? Math.round(topContainerBoundingClientRect.height * covered) : topContainerBoundingClientRect.height;
			const clipRectLeft = (from === 'right') ? Math.round(topContainerBoundingClientRect.width * (1 - covered)) : 0;

			this.elements.topContainer.style.clip = `rect(${clipRectTop}px, ${clipRectRight}px, ${clipRectBottom}px, ${clipRectLeft}px)`;


			const coverContainerBoundingClientRect = this.elements.coverContainer.getBoundingClientRect();

			if(from === 'left' || from === 'right') {
				if(from === 'left')
					this.elements.coverContainer.style.left = `${Math.round(topContainerBoundingClientRect.width * covered) - (coverContainerBoundingClientRect.width / 2)}px`;
				else if(from === 'right')
					this.elements.coverContainer.style.left = `${Math.round(topContainerBoundingClientRect.width * (1 - covered)) - (coverContainerBoundingClientRect.width / 2)}px`;
				this.elements.coverContainer.style.top = `${Math.round(topContainerBoundingClientRect.height / 2) - (coverContainerBoundingClientRect.height / 2)}px`;
			}
			else if(from === 'top' || from === 'bottom') {
				if(from === 'top')
					this.elements.coverContainer.style.top = `${Math.round(topContainerBoundingClientRect.height * covered) - (coverContainerBoundingClientRect.height / 2)}px`;
				else if(from === 'bottom')
					this.elements.coverContainer.style.top = `${Math.round(topContainerBoundingClientRect.height * (1 - covered)) - (coverContainerBoundingClientRect.height / 2)}px`;
				this.elements.coverContainer.style.left = `${Math.round(topContainerBoundingClientRect.width / 2) - (coverContainerBoundingClientRect.width / 2)}px`;
			}

			this.dispatchEvent(new CustomEvent('cover', {detail: {
					covered: covered,
					from: from
				}}));

			this.emitMirror(mirrorTag, 'cover', [covered, from]);
		}
	}

	emitMirror(mirrorTag, functionName, functionArgs) {
		if(!Array.isArray(functionArgs))
			functionArgs = [];

		let emitMirrorDetail = {function: functionName, arguments: functionArgs};
		if(typeof mirrorTag !== 'undefined')
			emitMirrorDetail.tag = mirrorTag;

		this.dispatchEvent(new CustomEvent('mirror', {detail: emitMirrorDetail}));
	}

	static get observedAttributes() {
		return ['from', 'covered'];
	}

	static get validFroms() {
		return ['left', 'right', 'top', 'bottom'];
	}

	set from(from) {
		if(typeof from !== 'string' || !AdjustableSlider.validFroms.includes(from.toLowerCase()))
			throw new Error(`Invalid from`);
		else {
			const sanitizedFrom = from.toLowerCase();
			if(this._from !== sanitizedFrom) {
				this._from = sanitizedFrom;
				this.cover();
			}
		}
	}

	get from() {
		return this.hasOwnProperty('_from') ? this._from : undefined;
	}

	set covered(covered) {
		const sanitizedCovered = Number(covered);
		if(sanitizedCovered >= 0 && sanitizedCovered <= 1) {
			if(this._covered !== sanitizedCovered) {
				this._covered = sanitizedCovered;
				this.cover();
			}
		}
		else
			throw new Error(`Covered must be between 0 and 1`);
	}

	get covered() {
		return this.hasOwnProperty('_covered') ? this._covered : undefined;
	}

	attributeChangedCallback(attribute, oldVal, newVal) {
		this[attribute.toLowerCase()] = newVal;
	}
}

customElements.define('adjustable-slider', AdjustableSlider);

export default AdjustableSlider;
