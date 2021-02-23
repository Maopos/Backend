'use strict'

var Project = require('../models/project');
var fs = require('fs');
const { exists } = require('../models/project');
var path = require('path');

var controller = {
    home: function (req, res) {
        return res.status(200).send({
            message: 'Soy la Home...'
        });
    },

    test: function (req, res) {
        return res.status(200).send({
            message: 'Soy el metodo test del controller...'
        });
    },

    saveProject: function (req, res) {
        var project = new Project();

        var params = req.body;
        project.name = params.name;
        project.description = params.description;
        project.category = params.category;
        project.languaje = params.languaje;
        project.year = params.year;
        project.image = null;

        project.save((err, projectStored) =>{
            if(err) return res.status(500).send({message: 'Error al guardar...'});
            
            if(!projectStored) return res.status(404).send({message: 'No se ha podido guardar el proyecto...'});
            return res.status(200).send({project: projectStored});
        });       
    },

    getProject: function(req,res) {
        var projectId = req.params.id;

        if(projectId == null) return res.status(404).send({message: 'No existe este documento...'});        

        Project.findById(projectId, (err, project) => {
            if(err) return res.status(500).send({message: 'Error al devolver los datos...'});

            if(!project) return res.status(404).send({message: 'No existe este documento...'});

            return res.status(200).send({project});
        });
    },

    getList: function (req, res) {
        
        Project.find({}).sort('year').exec((err, projects) => {
            if(err) return res.status(500).send({message: 'Error al devolver los datos...'});

            if(!projects) return res.status(404).send({message: 'No existe ningún documento...'});

            return res.status(200).send({projects});
        });
    },

    updateProject: function (req,res) {
        
        var projectId = req.params.id;
        var update = req.body;

        Project.findByIdAndUpdate(projectId, update, {new:true}, (err, projectUpdated) => {
            if(err) return res.status(500).send({message: 'Error al actualizar...'});

            if(!projectUpdated) return res.status(404).send({message: 'No existe este documento...'});

            return res.status(200).send({project: projectUpdated});
        });
    },

    deleteProject: function (req,res) {
        
        var projectId = req.params.id;
        

        Project.findByIdAndRemove(projectId, (err, projectDeleted) => {
            if(err) return res.status(500).send({message: 'Error al borrar documento...'});

            if(!projectDeleted) return res.status(404).send({message: 'No existe este documento...'});

            return res.status(200).send({project: projectDeleted});
        });
    },

    uploadImage: function (req, res) {
        var projectId = req.params.id;
        var fileName = 'La imagen no se pudo cargar...';

        if(req.files){
            var filePath = req.files.image.path;
            var fileSplit = filePath.split('\\');
            var fileName = fileSplit[1];
            var extSplit = fileName.split('\.');
            var fileExt = extSplit[1];

            if (fileExt == 'png' || fileExt == 'jpg' || fileExt == 'jpeg' || fileExt == 'gif') {
                
                Project.findByIdAndUpdate(projectId, {image: fileName}, {new: true}, (err, projectUpdated) => {
                    if(err) return res.status(500).send({message: 'Error al subir imagen...'});
    
                    if(!projectUpdated) return res.status(404).send({message: 'No existe este documento...'});
        
                    return res.status(200).send({project: projectUpdated});
                });
            }
            else {
                fs.unlink(filePath, (err) => {
                        return res.status(200).send({
                            message: 'La extension no es valida...'
                        });
                });
            }
            
        }
        else {
            return res.status(200).send({
                message: fileName
            }) 
        }
    },

    getImageFile: function(req, res){
         var file = req.params.image;
         var path_file = './uploads/' + file;
         
         fs.access(path_file, fs.constants.F_OK, (err) => {
             if (err) {
                return res.status(200).send({
                    message: 'No existe la imagen...'
                })
                
             }
             else {
                return res.sendFile(path.resolve(path_file));
             }
         })
        
    }
};

module.exports = controller;

// fs.access(pathFile,fs.constants.F_OK,(err)=>{
//     if(!err){
//         return res.sendFile(path.resolve(pathFile));
//     }else{
//         return res.status(200).send({message: "No exisite la imagen"});
//     }
// });