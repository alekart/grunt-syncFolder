# grunt-syncFolder v0.1.0

Compares 'folder' and 'source' paths
and removes files from 'folder' that has no equivalent in the 'source'
if tinyPng file is provided the files reference to the file will be removed

## Settings
```js
syncFolder: {
	images: {
		options: {
			folder: 'dist/images',
			source: 'src/images_unminified',
			tinypng: 'src/images_unminified/tinypng.json'
		}
	}
}
```
