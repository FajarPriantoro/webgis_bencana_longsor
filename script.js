// ====================================
// INISIALISASI PETA
// ====================================

var map = L.map('map').setView([-5.2, 105.1], 8);

L.tileLayer(
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19
    }
).addTo(map);

// ====================================
// VARIABEL GLOBAL
// ====================================

var geojsonData;
var geojsonLayer;

// ====================================
// WARNA BERDASARKAN KERAWANAN
// ====================================

function getColor(status) {

    switch(status){

        case "Berpotensi Tinggi":
            return "#dc2626";

        case "Berpotensi Sedang":
            return "#f59e0b";

        case "Tidak Berpotensi":
            return "#22c55e";

        default:
            return "#94a3b8";
    }
}

// ====================================
// RENDER PETA
// ====================================

function renderMap(filter="Semua", keyword="") {

    if(geojsonLayer){
        map.removeLayer(geojsonLayer);
    }

    const listContainer =
        document.querySelector(".school-list");

    listContainer.innerHTML = "";

    geojsonLayer = L.geoJSON(geojsonData, {

        filter: function(feature){

            let wilayah =
                feature.properties.kab_kot || "";

            let kerawanan =
                feature.properties.KERAWANAN || "";

            let cocokFilter =
                filter === "Semua" ||
                kerawanan === filter;

            let cocokCari =
                wilayah.toLowerCase()
                .includes(keyword.toLowerCase());

            return cocokFilter && cocokCari;
        },

        style: function(feature){

            return {
                color:"#ffffff",
                weight:1,
                fillOpacity:0.7,
                fillColor:getColor(
                    feature.properties.KERAWANAN
                )
            };
        },

        onEachFeature:function(feature,layer){

            let wilayah =
                feature.properties.kab_kot ||
                "Tidak diketahui";

            let kerawanan =
                feature.properties.KERAWANAN ||
                "Tidak diketahui";

            // Popup

            layer.bindPopup(`
                <b>${wilayah}</b><br>
                Status :
                <span style="
                    color:${getColor(kerawanan)};
                    font-weight:bold;">
                    ${kerawanan}
                </span>
            `);

            // Hover

            layer.on("mouseover",function(){

                this.setStyle({
                    weight:3,
                    fillOpacity:0.9
                });

            });

            layer.on("mouseout",function(){

                this.setStyle({
                    weight:1,
                    fillOpacity:0.7
                });

            });

            // Daftar Wilayah

            let item =
                document.createElement("div");

            item.className =
                "school-item";

            item.innerHTML = `
                <div class="school-name">
                    ${wilayah}
                </div>

                <div class="school-meta">
                    ${kerawanan}
                </div>
            `;

            item.onclick = function(){

                map.fitBounds(
                    layer.getBounds()
                );

                layer.openPopup();
            };

            listContainer.appendChild(item);
        }

    }).addTo(map);
}

// ====================================
// LOAD GEOJSON
// ====================================

fetch("Kerawanan_Longsor.geojson")

.then(response => {

    if(!response.ok){
        throw new Error(
            "GeoJSON tidak ditemukan"
        );
    }

    return response.json();
})

.then(data => {

    geojsonData = data;

    renderMap();

    map.fitBounds(
        geojsonLayer.getBounds()
    );
})

.catch(error => {

    console.error(error);

    document.querySelector(
        ".school-list"
    ).innerHTML = `
        <div style="
            padding:15px;
            color:red;">
            Gagal memuat data GeoJSON
        </div>
    `;
});

// ====================================
// FILTER BUTTON
// ====================================

document
.querySelectorAll(".filter-btn")
.forEach(btn => {

    btn.addEventListener(
        "click",
        function(){

            document
            .querySelectorAll(".filter-btn")
            .forEach(b =>
                b.classList.remove("active")
            );

            this.classList.add("active");

            let keyword =
                document.querySelector(
                    ".search-bar input"
                ).value;

            renderMap(
                this.innerText.trim(),
                keyword
            );
        }
    );
});

// ====================================
// SEARCH
// ====================================

document
.querySelector(".search-bar input")
.addEventListener(
    "keyup",
    function(){

        let filter =
            document.querySelector(
                ".filter-btn.active"
            ).innerText.trim();

        renderMap(
            filter,
            this.value
        );
    }
);