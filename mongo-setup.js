db.Page.createIndex({'name': 1}, { sparse: true });
db.Speciality.createIndex({'name': 1}, { sparse: true });
db.Substance.createIndex({'name': 1}, { sparse: true });
db.Pathology.createIndex({'name': 1}, { sparse: true });
db.Pathology.createIndex({'levels.entries.product._id': 1}, { sparse: true });
db.Pathology.createIndex({'levels.levels.entries.product._id': 1}, { sparse: true });
db.Pathology.createIndex({'levels.levels.levels.entries.product._id': 1}, { sparse: true });
db.Pathology.createIndex({'levels.levels.levels.levels.entries.product._id': 1}, { sparse: true });