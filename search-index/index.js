
/**
  * $ node search-index [query] ['elastic']
  * @param {1} query - search term 
  * @param {2} elastic - (optional) set to 'elastic' to use elasticlunr 
  * 
*/

const fs = require('fs');
const path = require('path');
const lunr = require('lunr');
const elasticlunr = require('elasticlunr');
const axios = require('axios');
// data getting from view REST export https://edit.stage.mass.gov/admin/structure/views/view/data_listing_all
// const rawData = require ('./data.json');

const dataPath = path.resolve(__dirname, './data.json');
const indexPath = path.resolve(__dirname, './index.json');
const indexElasticPath = path.resolve(__dirname, './index-elastic.json');

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
        
        
        let idx;

        if(process.argv[3] === 'elastic') {

            idx = elasticlunr(function () {
                this.setRef('nid');
                this.addField('title');
                this.addField('description');

                data.forEach(function (doc) {
                    this.addDoc(doc)
                }, this)
                
            });
            fs.writeFileSync(indexElasticPath, JSON.stringify(idx, null, 2), (error) => {
                if (error) throw error;
            });

        } else {
            idx = lunr(function () {
                this.ref('nid')
                this.field('title')
                this.field('description')
                
                data.forEach(function (doc) {
                    this.add(doc)
                }, this)
            });
            fs.writeFileSync(indexPath, JSON.stringify(idx, null, 2), (error) => {
                if (error) throw error;
            });
        }

        
        const query = process.argv[2];
        const results = idx.search(query);
        console.log('results: ')
        console.log(results)
        

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

