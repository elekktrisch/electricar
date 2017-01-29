export class KnowhowCtrl {
    constructor($scope, $location, $routeParams, $anchorScroll) {
        $scope.term = $routeParams.term;
        $anchorScroll.yOffset = 0;   // always scroll by extra pixels
        $location.hash($scope.term);
    }
}

