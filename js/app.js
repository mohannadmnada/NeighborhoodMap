var map;

var neighborhoodSpots = [
    {name: 'Faisal Islamic Bank Cairo', coord:{lng: 31.245765 , lat:30.052753 }},
    {name: 'Banque Misr For Islamic Transactions', coord:{lng: 31.244284 , lat:30.052246 }},
    {name: 'CairoKhan Hotel Cairo', coord:{lng: 31.244193 , lat:30.052410 }},
    {name: 'Gad Restaurant', coord:{lng: 31.242929 , lat:30.052673 }},
    {name: 'El Abd', coord:{lng: 31.242339 , lat:30.052540 }},
    {name: 'Awlad Ragab', coord:{lng: 31.242985 , lat:30.052173 }},
    {name: 'Al Americaine', coord:{lng: 31.244601 , lat:30.052679 }}
];

function AppViewModel() {
    var self= this;
    this.searchedItem = ko.observable("");
    self.locationList = ko.observableArray(neighborhoodSpots);
    this.listMarkerInfo = new google.maps.InfoWindow();
    this.markers=[];

    // List View of Neighborhood Spots With Searching Functionality
    this.listView = function(){
        self.locationList([]);
        if (this.searchedItem()===""){
            for (var i=0;i < neighborhoodSpots.length;i++)
            self.locationList.push(neighborhoodSpots[i]);
        }
        else{
            for (var a = 0; a<neighborhoodSpots.length;a++){
                if (neighborhoodSpots[a].name.toLocaleLowerCase().includes(this.searchedItem())){
                    self.locationList.push(neighborhoodSpots[a]);
                }
            }
        }

        // Hiding all but desired markers
        for (var j =0; j<this.markers.length;j++){
            this.markers[j].mapsMarker.setMap(null);
        }
        for (var k =0; k<this.markers.length;k++){
            for (var l =0; l<this.locationList().length;l++){
                if (this.locationList()[l].name == this.markers[k].name){
                    this.markers[k].mapsMarker.setMap(map);
                    this.markers[k].mapsMarker.setAnimation(4);
                }
            }
        }


    };



    // Rendering map to page along with markers creation and enabling infoWindow instantiation.
    this.initMap = function() {
        this.markerInfo = new google.maps.InfoWindow();
        map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 30.052557, lng: 31.244284},
          zoom: 18,
          mapTypeControl: false
        });
        function initInfoWindow(){
            self.getInfo(this,self.markerInfo);
        }
        for (var i = 0; i< neighborhoodSpots.length;i++){

            this.marker = new google.maps.Marker({
                name: neighborhoodSpots[i].name,
                position: neighborhoodSpots[i].coord,
                animation: google.maps.Animation.DROP,
                map:map
            });
            this.marker.addListener('click', function(){
                this.setAnimation(4);
            });
            
            this.marker.addListener('click', initInfoWindow);
            this.markers.push({mapsMarker: this.marker, name: neighborhoodSpots[i].name });  
        }
        
      };
    this.initMap();
    // console.log(this.markers);


    // Animating List Entry and Generating infoWindow
    this.goToMarker = function(chosenSpot){
        // console.log(chosenSpot.name);
        // console.log(self.markers);
        for (var i = 0; i<self.markers.length;i++){
            if (self.markers[i].name == chosenSpot.name){
                this.markerFromList = self.markers[i];
            }
        }
        // console.log(this.markerFromList);
        // console.log(self.markerInfo);
        this.markerFromList.mapsMarker.setAnimation(4);
        var url = 'https://api.foursquare.com/v2/venues/search?query=' + this.markerFromList.name.split(" ")[0] + '&ll=' + 
        this.markerFromList.mapsMarker.position.lat() + ',' + this.markerFromList.mapsMarker.position.lng() + 
        '&oauth_token=X0KE3R0WRFQYYSEDZBVSG32VKLJVUNC3YHXR5Z3V0GSZHFAU&v=20180312';
        console.log(this.markerFromList);
        $.ajax({
            url:url,
            markerFromList:this.markerFromList,
            success: function(response){
                // Chosen 3rd query object upon trial and error
                var infoObject = response.response.venues[2];
                if (infoObject.location.address===undefined){
                    infoObject.location.address="26 July Street";
                }

                if (infoObject.contact.phone===undefined){
                    infoObject.contact.phone="112 (Phonebook Service)";
                }
                // console.log(this.markerFromList);
                self.listMarkerInfo.setContent(
                    '<div style="text-align:center">' +
                    '<h1>' + this.markerFromList.name + '</h1>' +
                    '<p> Address: ' + infoObject.location.address + '</p>' + 
                    '<p> Phone: '  + infoObject.contact.phone + '</p>' + 
                    '<p> Country: ' + infoObject.location.country + '</p>' + 
                     '</div>'
                );
            }
        }).fail(function(){
            alert('Error encountered while fetching info.');
        });

        // console.log(self.listMarkerInfo);
        self.listMarkerInfo.open(map, this.markerFromList.mapsMarker);



    };



    // Get Marker Info (3rd Part API ~ Foursquare)
    this.getInfo = function(marker, infoWindow){
        var url = 'https://api.foursquare.com/v2/venues/search?query=' + marker.name.split(" ")[0] + '&ll=' + 
        this.marker.position.lat() + ',' + this.marker.position.lng() + 
        '&oauth_token=X0KE3R0WRFQYYSEDZBVSG32VKLJVUNC3YHXR5Z3V0GSZHFAU&v=20180312';
        $.ajax({
            url:url,
            success: function(response){
                // Chosen 3rd query object upon trial and error
                var infoObject = response.response.venues[2];
                if (infoObject.location.address===undefined){
                    infoObject.location.address="26 July Street";
                }

                if (infoObject.contact.phone===undefined){
                    infoObject.contact.phone="112 (Phonebook Service)";
                }

                // console.log(infoObject);
                infoWindow.setContent(
                    '<div style="text-align:center">' +
                    '<h1>' + marker.name + '</h1>' +
                    '<p> Address: ' + infoObject.location.address + '</p>' + 
                    '<p> Phone: '  + infoObject.contact.phone + '</p>' + 
                    '<p> Country: ' + infoObject.location.country + '</p>' + 
                     '</div>'
                );
            }
        }).fail(function(){
            alert('Error encountered while fetching info.');
        });

        // var addresses =document.getElementsByClassName('address');
        //    for(var i =0; i<addresses.length ;i++){
        //     google.maps.event.addListener(map,'bounds_changed', function() {
        //         addresses[i].bindTo(map, marker);
        //         infoWindow.open(map, marker);
                
        //       });
        //    }
        
                //     document.getElementById('').bindTo(map, marker );
        //   });
            // console.log(map);
            infoWindow.open(map, marker);
        
    };



}

function handleError(){
    alert("Error loading Google Maps object.");
}


function bind() {
    ko.applyBindings(new AppViewModel());
}