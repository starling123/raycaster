function toBase64(u8) {
    return btoa(String.fromCharCode.apply(null, u8));
}

export async function loadFile(url) {
	let r = await fetch(url);
	console.log(r);
	let data = await r.body.getReader().read();
	return data.value;
}

export async function loadImage(url) {
	let ext = url.split(".").pop();
	let data = await loadFile(url);
    let imageUrl = "data:image/png;base64," + toBase64(data);
    let image = new Image();
    image.src = imageUrl;
	return image;
}

