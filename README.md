- It is required to set ```--side``` for the side length of the diamonds (which are squares), and ```--gap``` for the gap between them.
- To prevent FOUC, add the ```hidden``` attribute.
- Hide your diamonds with the ```hidden``` attribute, so that it triggers recalculation.
```html
<script src="script.js" type="module"></script>
<diamond-grid hidden style="--side: 20em; --gap: .5em;">
    <!--Your diamonds-->
    <div>1</div>
    <div hidden>1</div>
    <div>3</div>
</diamond-grid>
```
