function toBase64(u8) {
    return btoa(String.fromCharCode.apply(null, u8));
}

export async function loadImage(url) {
	let ext = url.split(".").pop();
	let r = await fetch(url);
	console.log(r);
	let data = await r.body.getReader().read();
    let imageUrl = "data:image/png;base64," + toBase64(data.value);
    let image = new Image();
    image.src = imageUrl;
	return image;
}

