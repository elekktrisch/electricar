export class DomainInfo {
    static factory() {
        //var alternativeHost = 'localhost';
        var alternativeHost = 'digital-driving.info';
        return {
            titlePrefix: function () {
                return window.location.hostname === alternativeHost ? 'Digital' : 'Electri';
            },
            titlePostfix: function () {
                return window.location.hostname === alternativeHost ? 'Driving' : 'Car';
            }
        };
    }
}

export class Cars {
    static factory($resource) {
        return $resource('scripts/data/cars.json');
    }
}

export class Plugs {
    static factory($resource) {
        return $resource('scripts/data/plugs.json');
    }
}

export class Circles {
    constructor() {
    }

    createCircle(id, name, center, color) {
        return {
            id: id,
            name: name,
            center: center,
            radius: 500000,
            stroke: {
                color: color,
                weight: 2,
                opacity: 1
            },
            fill: {
                color: color,
                opacity: 0.2
            },
            geodesic: true, // optional: defaults to false
            draggable: true, // optional: defaults to false
            clickable: true, // optional: defaults to true
            editable: true, // optional: defaults to false
            visible: true // optional: defaults to true
        };
    }
}