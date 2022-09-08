
/**
  * $ node search-index [query]
  * @param {1} query - search term
*/

const fs = require('fs');
const path = require('path');
const lunr = require('lunr');
const axios = require('axios');
// data getting from view REST export https://edit.stage.mass.gov/admin/structure/views/view/data_listing_all
// const rawData = require ('./data.json');

const dataPath = path.resolve(__dirname, './data.json');
const indexPath = path.resolve(__dirname, './index.json');

axios({
    method: 'get',
    url: 'https://edit.stage.mass.gov/api/data-listing/all'
  })
    .then(function (response) {
        const rawData = response.data.dataset;
        fs.writeFileSync(dataPath, JSON.stringify(rawData, null, 2), (error) => {
            if (error) throw error;
        })

        data = rawData.map((d) => (
            {
                nid: d.nid,
                url: `https:/mass.gov/node/${d.nid}`,
                title: d.title,
                description: d.field_externaldata_description || d.description__value,
            }
        ))
        
        console.log('total data records:' + data.length);
        
        
        var idx = lunr(function () {
            this.ref('nid')
            this.field('title')
            this.field('description')
          
            data.forEach(function (doc) {
              this.add(doc)
            }, this)
        });
        
        const query = process.argv[2];
        const results = idx.search(query);
        console.log('results: ')
        console.log(results)
        
        fs.writeFileSync(indexPath, JSON.stringify(idx, null, 2), (error) => {
            if (error) throw error;
        });
    });

// normalize entity data
// data = rawData.map((d) => (
//     {
//         nid: d.nid[0],
//         url: `https:/mass.gov${d.entity_url}`,
//         title: d.title[0],
//         description: d.metatag.value.description,
//         org: d.metatag.value.mg_stakeholder_org
//     }
// ))

