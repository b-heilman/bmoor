class ReadOnly {
	constructor(map) {
		this.has = function (key) {
			return map.has(key);
		};

		this.get = function (key) {
			return map.get(key);
		};

		this.forEach = function (...args) {
			return map.forEach(...args);
		};

		this.keys = function () {
			return map.keys();
		};

		this.values = function () {
			return map.values();
		};
	}
}

class Registry extends Map {
	getReadOnly() {
		return new ReadOnly(this);
	}
}

module.exports = {
	ReadOnly,
	Registry
};
