export class KnowhowCtrl {
    constructor($scope, $location, $routeParams, $anchorScroll) {
        $scope.term = $routeParams.term;
        $anchorScroll.yOffset = 0;   // always scroll by extra pixels
        $location.hash($scope.term);
        let images = [
            "wall_t13",
            "wall_schuko",
            "caravan",
            "wall_cee",
            "cee64",
            "auto_type1",
            "auto_type2",
            "auto_type3",
            "auto_chademo",
            "auto_ccs",
            "tesla-supercharger"
        ];

        $scope.image = [];
        for (let i = 0; i < images.length; i++) {
            $scope.image[images[i]] = require(`../../images/${images[i]}.jpg`);
        }
    }
}

