
/**
  * $ node search-index [query]
  * @param {1} query - search term
*/

const fs = require('fs');
const path = require('path');
const lunr = require('lunr');
// data getting from view REST export https://edit.stage.mass.gov/admin/structure/views/view/data_listing_all
const rawData = require ('./data.json');

const docsPath = path.resolve(__dirname, './index.json');

data = rawData.map((d) => (
    {
        nid: d.nid[0],
        url: `https:/mass.gov${d.entity_url}`,
        title: d.title[0],
        description: d.metatag.value.description,
        org: d.metatag.value.mg_stakeholder_org
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

fs.writeFileSync(docsPath, JSON.stringify(idx, null, 2), (error) => {
    if (error) throw error;
});