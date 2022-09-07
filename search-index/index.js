
const lunr = require('lunr');
const rawData = require ('./data.json');

data = rawData.map((d) => (
    {
        nid: d.nid[0],
        url: `https:/mass.gov${d.entity_url}`,
        title: d.title[0],
        description: d.metatag.value.description,
        org: d.metatag.value.mg_stakeholder_org
    }
))

var idx = lunr(function () {
    this.ref('nid')
    this.field('title')
    this.field('description')
  
    data.forEach(function (doc) {
      this.add(doc)
    }, this)
});

console.log(idx)