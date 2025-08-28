define(["react/jsx-runtime","@vertigis/web/components","@vertigis/web/ui/IconButton","@vertigis/web/ui/hooks","@vertigis/web/ui/icons/MapSyncOff","@vertigis/web/ui/icons/MapSyncOn","react","@arcgis/core/geometry/Point","@vertigis/web/models"],((e,t,i,n,r,s,a,o,c,l,h,u,d)=>(()=>{
  "use strict";
  var p = {
    5393:(e,t,i)=>{
      i.d(t,{A:()=>o});
      var n=i(6758),r=i.n(n),s=i(935),a=i.n(s)()(r());
      a.push([e.id,".third-party-map-controls{position:absolute;top:1rem;right:1rem;background-color:var(--buttonBackground);opacity:0.8;}.third-party-map-controls:hover{opacity:1;}.third-party-map-controls button{border-radius:inherit;}.third-party-map-controls svg{fill:var(--buttonIcon);}"], e.id, "");
    }
  };

  // Step 1: Add a function to define the designer settings UI
  function getDesignerSettingsSchema(e) {
    return {
        $type: "object",
        $title: "language-designer-gsv-title",
        properties: {
            apiKey: {
                $title: "language-designer-gsv-key-title",
                $description: "language-designer-gsv-key-description",
                $type: "string"
            }
        }
    };
  }

  // Step 2: Access the API key from the component settings
  function createStreetViewWidget() {
    // VertiGIS Studio Web component
    const { useComponent, useMap, useWatch } = useComponent({
      useMap: true
    });
    
    // Get the API key from the component properties
    const { apiKey } = useComponent().props;

    // Street View panorama instance
    const [panorama, setPanorama] = useState(null);
    // Positional sync state
    const [isSynced, setIsSynced] = useState(true);

    // Get the map instance
    const map = useMap();
    
    // Watch for map changes
    useWatch(() => {
      if (isSynced && map && panorama) {
        const center = map.center;
        const streetViewService = new google.maps.StreetViewService();
        streetViewService.getPanorama({
          location: { lat: center.latitude, lng: center.longitude },
          radius: 50 // Search radius in meters
        }, (data, status) => {
          if (status === google.maps.StreetViewStatus.OK) {
            panorama.setPosition(data.location.latLng);
            panorama.setVisible(true);
          } else {
            console.warn("No Street View data available for this location.");
            panorama.setVisible(false);
          }
        });
      }
    }, [map.center, isSynced, panorama]);

    // Initialize Google Street View
    useEffect(() => {
      const container = document.getElementById("street-view-container");
      if (container && apiKey) {
        // Load the Google Maps API script
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        document.head.appendChild(script);

        script.onload = () => {
          const sv = new google.maps.StreetViewPanorama(container, {
            position: { lat: 0, lng: 0 },
            visible: false,
            pov: { heading: 0, pitch: 0 }
          });
          setPanorama(sv);

          // Listen for Street View position changes and update the map (optional)
          sv.addListener("position_changed", () => {
            const pov = sv.getPov();
            const position = sv.getPosition();
            // You can add logic here to update the map based on the new Street View position
          });
        };
      }
    }, [apiKey]); // Added apiKey to the dependency array

    // Toggle sync state
    const handleSyncClick = () => {
      setIsSynced(!isSynced);
    };

    return (
      <div>
        <div id="street-view-container" style={{ width: '100%', height: '100%' }}></div>
        <div className="third-party-map-controls">
          <IconButton
            iconId={isSynced ? 'map-sync-on' : 'map-sync-off'}
            onClick={handleSyncClick}
            title={isSynced ? 'Disable positional sync' : 'Enable positional sync'}
          />
        </div>
      </div>
    );
  }

  // Register the component with VertiGIS Studio Web
  WS.registerComponent({
    name: "google-street-view",
    namespace: "vertigis.web.incubator",
    getComponentType: () => createStreetViewWidget,
    itemType: "google-street-view",
    title: "Google Street View",
    iconId: "map-3d",
    // Step 3: Add the getDesignerSettingsSchema function to the component definition
    getDesignerSettingsSchema
  });

  // Register the model for the component
  WS.registerModel({
    getModel: e => new FS(e),
    itemType: "google-street-view"
  });

  // Register language resources
  WS.registerLanguageResources({
    locale: "inv",
    values: {
      "language-web-incubator-google-street-view-title": "Google Street View",
      "language-web-incubator-google-street-view-enable-sync-title": "Enable positional sync",
      "language-web-incubator-google-street-view-disable-sync-title": "Disable positional sync",
      "language-designer-gsv-title": "Google Street View",
      "language-designer-gsv-key-title": "Google Maps API Key",
      "language-designer-gsv-key-description": "Enter your Google Maps API Key to enable the Street View component."
    }
  });

  // Add CSS styles
  const styles = document.createElement("style");
  styles.innerHTML = ".third-party-map-controls{position:absolute;top:1rem;right:1rem;background-color:var(--buttonBackground);opacity:0.8;}.third-party-map-controls:hover{opacity:1;}.third-party-map-controls button{border-radius:inherit;}.third-party-map-controls svg{fill:var(--buttonIcon);}"
  document.head.appendChild(styles);

  // Return the main module
  return {};
})());