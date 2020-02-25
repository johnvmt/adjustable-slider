## Adjustable Slider

A web component to display a before-and-after slider

### Parameters

* from: edge to start the slide from (left - default, right, top, bottom)
* covered: percentage of slider to cover (0-1)

### Slots

* top: top layer (the "after" picture)
* bottom: bottom layer (the "before" picture)
* cover: overlaid over the edge between the top and bottom layer

### Example

    <script type="module" src="AdjustableSlider.js"></script>
    	
    <adjustable-slider from="bottom" covered="0.3" style="width: 75vw; height: 40vh; position: absolute; top: 20vh; left: 5vw;">
        <img style="width: 50px; height: 50px; margin: 0;" slot="cover" src="images/grabber.png" />
        <img style="width: 100%; height: 100%; margin: 0;" slot="top" src="images/toplayer.png" />
        <img style="width: 100%; height: 100%; margin: 0;" slot="bottom" src="images/bottomlayer.png" />
    </adjustable-slider>
    <div id="number" style="position: absolute; top: 45vh; left: 82vw;"></div>
    <script>

        const slider = document.querySelector('adjustable-slider');
        const numberContainer = document.querySelector('#number');

        slider.addEventListener('cover', (event) => {
            const percentageX = event.detail.covered;
            numberContainer.innerHTML = `${Math.round(percentageX * 100)}%`;
        });
    </script>