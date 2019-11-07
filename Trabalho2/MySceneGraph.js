var DEGREE_TO_RAD = Math.PI / 180;

// Order of the groups in the XML document.
var SCENE_INDEX = 0;
var VIEWS_INDEX = 1;
var GLOBALS_INDEX = 2;
var LIGHTS_INDEX = 3;
var TEXTURES_INDEX = 4;
var MATERIALS_INDEX = 5;
var TRANSFORMATIONS_INDEX = 6;
var ANIMATOIONS_INDEX = 7;
var PRIMITIVES_INDEX = 8;
var COMPONENTS_INDEX = 9;

/**
 * MySceneGraph class, representing the scene graph.
 */
class MySceneGraph {
    /**
     * @constructor
     */
    constructor(filename, scene) {
        this.loadedOk = true;

        // Establish bidirectional references between scene and graph.
        this.scene = scene;
        scene.graph = this;

        this.nodes = [];

        this.idRoot = null;                    // The id of the root element.

        this.axisCoords = [];
        this.axisCoords['x'] = [1, 0, 0];
        this.axisCoords['y'] = [0, 1, 0];
        this.axisCoords['z'] = [0, 0, 1];

        // File reading 
        this.reader = new CGFXMLreader();

        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */
        this.reader.open('scenes/' + filename, this);
    }

    /*
     * Callback to be executed after successful reading
     */
    onXMLReady() {
        this.log("XML Loading finished.");
        var rootElement = this.reader.xmlDoc.documentElement;

        // Here should go the calls for different functions to parse the various blocks
        var error = this.parseXMLFile(rootElement);

        if (error != null) {
            this.onXMLError(error);
            return;
        }

        if(!this.loadedOk) return;

        this.loadedOk = true;

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        this.scene.onGraphLoaded();
    }

    /**
     * Parses the XML file, processing each block.
     * @param {XML root element} rootElement
     */
    parseXMLFile(rootElement) {
        if (rootElement.nodeName != "lxs")
            return "root tag <lxs> missing";

        var nodes = rootElement.children;

        // Reads the names of the nodes to an auxiliary buffer.
        var nodeNames = [];

        for (var i = 0; i < nodes.length; i++) {
            nodeNames.push(nodes[i].nodeName);
        }

        var error;

        // Processes each node, verifying errors.

        // <scene>
        var index;
        if ((index = nodeNames.indexOf("scene")) == -1)
            return "tag <scene> missing";
        else {
            if (index != SCENE_INDEX)
                this.onXMLMinorError("tag <scene> out of order " + index);

            //Parse scene block
            if ((error = this.parseScene(nodes[index])) != null)
                return error;
        }

        // <views>
        if ((index = nodeNames.indexOf("views")) == -1)
            return "tag <views> missing";
        else {
            if (index != VIEWS_INDEX)
                this.onXMLMinorError("tag <views> out of order");

            //Parse views block
            if ((error = this.parseView(nodes[index])) != null)
                return error;
        }

        // <ambient>
        if ((index = nodeNames.indexOf("globals")) == -1)
            return "tag <globals> missing";
        else {
            if (index != GLOBALS_INDEX)
                this.onXMLMinorError("tag <globals> out of order");

            //Parse ambient block
            if ((error = this.parseGlobals(nodes[index])) != null)
                return error;
        }

        // <lights>
        if ((index = nodeNames.indexOf("lights")) == -1)
            return "tag <lights> missing";
        else {
            if (index != LIGHTS_INDEX)
                this.onXMLMinorError("tag <lights> out of order");

            //Parse lights block
            if ((error = this.parseLights(nodes[index])) != null)
                return error;
        }
        // <textures>
        if ((index = nodeNames.indexOf("textures")) == -1)
            return "tag <textures> missing";
        else {
            if (index != TEXTURES_INDEX)
                this.onXMLMinorError("tag <textures> out of order");

            //Parse textures block
            if ((error = this.parseTextures(nodes[index])) != null)
                return error;
        }

        // <materials>
        if ((index = nodeNames.indexOf("materials")) == -1)
            return "tag <materials> missing";
        else {
            if (index != MATERIALS_INDEX)
                this.onXMLMinorError("tag <materials> out of order");

            //Parse materials block
            if ((error = this.parseMaterials(nodes[index])) != null)
                return error;
        }

        // <transformations>
        if ((index = nodeNames.indexOf("transformations")) == -1)
            return "tag <transformations> missing";
        else {
            if (index != TRANSFORMATIONS_INDEX)
                this.onXMLMinorError("tag <transformations> out of order");

            //Parse transformations block
            if ((error = this.parseTransformations(nodes[index])) != null)
                return error;
        }

        // <animations>
        if ((index = nodeNames.indexOf("animations")) == -1)
            return "tag <animations> missing";
        else {
            if (index != ANIMATOIONS_INDEX)
                this.onXMLMinorError("tag <animations> out of order " + index);

            //Parse scene block
            if ((error = this.parseAnimations(nodes[index])) != null)
                return error;
        }

        // <primitives>
        if ((index = nodeNames.indexOf("primitives")) == -1)
            return "tag <primitives> missing";
        else {
            if (index != PRIMITIVES_INDEX)
                this.onXMLMinorError("tag <primitives> out of order");

            //Parse primitives block
            if ((error = this.parsePrimitives(nodes[index])) != null)
                return error;
        }

        // <components>
        if ((index = nodeNames.indexOf("components")) == -1)
            return "tag <components> missing";
        else {
            if (index != COMPONENTS_INDEX)
                this.onXMLMinorError("tag <components> out of order");

            //Parse components block
            if ((error = this.parseComponents(nodes[index])) != null)
                return error;
        }
        this.log("all parsed");
    }

    /**
     * Parses the <scene> block. 
     * @param {scene block element} sceneNode
     */
    parseScene(sceneNode) {

        // Get root of the scene.
        var root = this.reader.getString(sceneNode, 'root')
        if (root == null)
            return "no root defined for scene";

        this.idRoot = root;

        // Get axis length        
        var axis_length = this.reader.getFloat(sceneNode, 'axis_length');
        if (axis_length == null)
            this.onXMLMinorError("no axis_length defined for scene; assuming 'length = 1'");

        this.referenceLength = axis_length;

        this.log("Parsed scene");

        return null;
    }

    /**
     * Parses the <views> block.
     * @param {view block element} viewsNode
     */
    parseView(viewsNode) {
        //get Default View ID for the nodes
        let defaultViewID = viewsNode.getAttribute("default");
        if(defaultViewID == null) this.onXMLMinorError("No default view defined.");

        this.views = [];
        this.defaultView = defaultViewID;

        let defaultViewExists = false;
        let nViews = 0;
        
        //get all views inside views element
        let children = viewsNode.children;
        if(children.length == 0) this.onXMLError("No views Provided!");
        for(let i = 0; i < children.length; i++) {
            let child = children[i];
            let name = child.nodeName;
            //if view has an invalid name throw error and proceed.
            if(name != "ortho" && name != "perspective") {
                this.onXMLMinorError("Unexpedted view: " + name);
                continue;
            }

            //get ID and test for errors.
            let viewId = child.getAttribute("id");
            if(viewId == null) this.onXMLMinorError("ID for " + name + " view not provided!");
            if(viewId == defaultViewID) defaultViewExists = true;
            
            //get near and far and test for errors.
            let viewNear = parseFloat(child.getAttribute("near"));
            if(viewNear == null) this.onXMLMinorError("Near attribute for " + name + " view not provided!");
            let viewFar = parseFloat(child.getAttribute("far"));
            if(viewFar == null) this.onXMLMinorError("Far attribute for " + name + " view not provided!");

            //get from array values and test for errors.
            let fromList = child.getElementsByTagName("from");
            let fromX;
            let fromY;
            let fromZ;
            if(fromList.length == 0) {
                this.onXMLMinorError("From element for " + name + " view not provided!");
            }
            else if(fromList.length > 1) {
                this.onXMLMinorError("More than 1 For element for " + name + " view provided!");
            }
            else {
                fromX = parseFloat(fromList[0].getAttribute("x"));
                fromY = parseFloat(fromList[0].getAttribute("y"));
                fromZ = parseFloat(fromList[0].getAttribute("z"));
            }

            //get to array values and test for errors.
            let toList = child.getElementsByTagName("to");
            let toX;
            let toY;
            let toZ;
            if(toList.length == 0) {
                this.onXMLMinorError("To element for " + name + " view not provided!");
            }
            else if(toList.length > 1) {
                this.onXMLMinorError("More than 1 To element for " + name + " view provided!");
            }
            else {
                toX = parseFloat(toList[0].getAttribute("x"));
                toY = parseFloat(toList[0].getAttribute("y"));
                toZ = parseFloat(toList[0].getAttribute("z"));
            }

            //create object with currentView to add to our views array
            let currentView = {id:viewId, near:viewNear, far:viewFar, from: vec3.fromValues(fromX,fromY,fromZ), to: vec3.fromValues(toX,toY,toZ)}
            
            //complete currentView object with appropriate information depending on the view type
            if(name == "perspective") {
                let viewAngle = parseFloat(child.getAttribute("angle"));
                if(viewAngle == null) this.onXMLMinorError("no angle attribute for " + name + " view provided!");
                currentView.type = "perspective";

                currentView.angle = viewAngle;
            }
            else if(name == "ortho") {
                let viewTop = parseFloat(child.getAttribute("top"));
                let viewBottom = parseFloat(child.getAttribute("bottom"));
                let viewLeft = parseFloat(child.getAttribute("left"));
                let viewRight = parseFloat(child.getAttribute("right"));

                let upList = child.getElementsByTagName("up");
                let upX = 0, upY = 1, upZ = 0;
                if(upList.length != 0) {
                    upX = parseFloat(upList[0].getAttribute("x"));
                    upY = parseFloat(upList[0].getAttribute("y"));
                    upZ = parseFloat(upList[0].getAttribute("z"));    
                }

                currentView.type = "ortho";
                currentView.top = viewTop;
                currentView.bottom = viewBottom;
                currentView.left = viewLeft;
                currentView.right = viewRight;
                currentView.up = vec3.fromValues(upX, upY, upZ);
            }

            this.views[viewId] = currentView;
            nViews++;
        }
        if(nViews == 0) this.onXMLError("No Views successfully loaded!");
        if(!defaultViewExists) this.onXMLError("Default View doesn't exist");

        return null;
    }

    /**
     * Parses the <globals> node.
     * @param {globals block element} globalsNode
     */
    parseGlobals(globalsNode) {

        var children = globalsNode.children;

        this.ambient = [];
        this.background = [];

        var nodeNames = [];

        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        var ambientIndex = nodeNames.indexOf("ambient");
        var backgroundIndex = nodeNames.indexOf("background");

        var color = this.parseColor(children[ambientIndex], "ambient");
        if (!Array.isArray(color))
            return color;
        else
            this.ambient = color;

        color = this.parseColor(children[backgroundIndex], "background");
        if (!Array.isArray(color))
            return color;
        else
            this.background = color;

        this.log("Parsed globals");

        return null;
    }

    /**
     * Parses the <light> node.
     * @param {lights block element} lightsNode
     */
    parseLights(lightsNode) {
        var children = lightsNode.children;

        this.lights = [];
        var numLights = 0;

        var grandChildren = [];
        var nodeNames = [];

        // Any number of lights.
        for (var i = 0; i < children.length; i++) {

            // Storing light information
            var global = [];
            var attributeNames = [];
            var attributeTypes = [];

            //Check type of light
            if (children[i].nodeName != "omni" && children[i].nodeName != "spot") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }
            else {
                attributeNames.push(...["location", "ambient", "diffuse", "specular"]);
                attributeTypes.push(...["position", "color", "color", "color"]);
            }

            // Get id of the current light.
            var lightId = this.reader.getString(children[i], 'id');
            if (lightId == null)
                return "no ID defined for light";

            // Checks for repeated IDs.
            if (this.lights[lightId] != null)
                return "ID must be unique for each light (conflict: ID = " + lightId + ")";

            // Light enable/disable
            var enableLight = true;
            var aux = this.reader.getBoolean(children[i], 'enabled');
            if (!(aux != null && !isNaN(aux) && (aux == true || aux == false))) {
                this.onXMLMinorError("unable to parse value component of the 'enable light' field for ID = " + lightId + "; assuming 'value = 1'");
                enabledLight = true;
            } else enableLight = aux;

            //Add enabled boolean and type name to light info
            global.push(enableLight);
            global.push(children[i].nodeName);

            grandChildren = children[i].children;
            // Specifications for the current light.

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            for (var j = 0; j < attributeNames.length; j++) {
                var attributeIndex = nodeNames.indexOf(attributeNames[j]);

                if (attributeIndex != -1) {
                    if (attributeTypes[j] == "position")
                        var aux = this.parseCoordinates4D(grandChildren[attributeIndex], "light position for ID" + lightId);
                    else
                        var aux = this.parseColor(grandChildren[attributeIndex], attributeNames[j] + " illumination for ID" + lightId);

                    if (!Array.isArray(aux))
                        return aux;

                    global.push(aux);
                }
                else
                    return "light " + attributeNames[i] + " undefined for ID = " + lightId;
            }

            // Gets the additional attributes of the spot light
            if (children[i].nodeName == "spot") {
                var angle = this.reader.getFloat(children[i], 'angle');
                if (!(angle != null && !isNaN(angle)))
                    return "unable to parse angle of the light for ID = " + lightId;

                var exponent = this.reader.getFloat(children[i], 'exponent');
                if (!(exponent != null && !isNaN(exponent)))
                    return "unable to parse exponent of the light for ID = " + lightId;

                var targetIndex = nodeNames.indexOf("target");

                // Retrieves the light target.
                var targetLight = [];
                if (targetIndex != -1) {
                    var aux = this.parseCoordinates3D(grandChildren[targetIndex], "target light for ID " + lightId);
                    if (!Array.isArray(aux))
                        return aux;

                    targetLight = aux;
                }
                else
                    return "light target undefined for ID = " + lightId;

                global.push(...[angle, exponent, targetLight])
            }

            this.lights[lightId] = global;
            numLights++;
        }

        if (numLights == 0)
            return "at least one light must be defined";
        else if (numLights > 8)
            this.onXMLMinorError("too many lights defined; WebGL imposes a limit of 8 lights");

        this.log("Parsed lights");
        return null;
    }

    /**
     * Parses the <textures> block. 
     * @param {textures block element} texturesNode
     */
    parseTextures(texturesNode) {
        this.textures = [];

        let children = texturesNode.children;
        //check if there are any textures
        if(children.length == 0)
            this.onXMLMinorError("No Textures in file");
        //get path and id of every texture
        for(let i = 0; i < children.length; i++) {
            let tex = children[i];

            let id = this.reader.getString(tex, "id");
            //check if ID is repeated
            if(this.textures[id] != null) {
                this.onXMLMinorError("Texture with repeated ID: " + id);
                continue;   
            }
            
            let path = this.reader.getString(tex, "file");
            console.log(path);
            let format = path.substring(path.length -4);
            //check if file format is supported
            if(format != ".png" && format != ".jpg") {
                this.onXMLMinorError("Texture " + id + " has an invalid file format.");
                continue;
            }

            //add texture to array
            this.textures[id] = new CGFtexture(this.scene, path);
        }
        return null;
    }

    /**
     * Parses the <materials> node.
     * @param {materials block element} materialsNode
     */
    parseMaterials(materialsNode) {
        var children = materialsNode.children;

        this.materials = [];

        // Any number of materials.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "material") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current material.
            var materialID = this.reader.getString(children[i], 'id');
            if (materialID == null)
                return "no ID defined for material";

            // Checks for repeated IDs.
            if (this.materials[materialID] != null)
                return "ID must be unique for each material (conflict: ID = " + materialID + ")";

            // get shininess for material and check for errors
            let shininess = this.reader.getFloat(children[i], 'shininess');
            if(shininess == null)
                return "no shininess defined for material with ID: " + materialID;

            // get emission for material and check for errors, then parse color into list
            let emission = children[i].getElementsByTagName("emission");
            if(emission.length == 0)
                return "no emission provided for materia with ID: " + materialID;
            else
                emission = this.parseColor(emission[0], "emission in " + materialID + "has an incorrect format");

            // get ambient for material and check for errors, then parse color into list
            let ambient = children[i].getElementsByTagName("ambient");
            if(ambient.length == 0)
                return "no ambient provided for materia with ID: " + materialID;
            else
                ambient = this.parseColor(ambient[0], "ambient in " + materialID + "has an incorrect format");

            // get diffuse for material and check for errors, then parse color into list
            let diffuse = children[i].getElementsByTagName("diffuse");
            if(diffuse.length == 0)
                return "no diffuse provided for materia with ID: " + materialID;
            else
                diffuse = this.parseColor(diffuse[0], "diffuse in " + materialID + "has an incorrect format");
            
            // get specular for material and check for errors, then parse color into list
            let specular = children[i].getElementsByTagName("specular");
            if(specular.length == 0)
                return "no specular provided for materia with ID: " + materialID;
            else
                specular = this.parseColor(specular[0], "specular in " + materialID + "has an incorrect format");

            // build final material with all attributes
            let material = new CGFappearance(this.scene);
            material.setAmbient(...ambient);
            material.setDiffuse(...diffuse);
            material.setSpecular(...specular);
            material.setShininess(shininess);
            material.setEmission(...emission);

            this.materials[materialID] = material;
        }

        this.log("Parsed materials");
        return null;
    }

    /**
     * Parses the <transformations> block.
     * @param {transformations block element} transformationsNode
     */
    parseTransformations(transformationsNode) {
        var children = transformationsNode.children;

        this.transformations = [];

        var grandChildren = [];

        // Any number of transformations.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "transformation") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current transformation.
            var transformationID = this.reader.getString(children[i], 'id');
            if (transformationID == null)
                return "no ID defined for transformation";

            // Checks for repeated IDs.
            if (this.transformations[transformationID] != null)
                return "ID must be unique for each transformation (conflict: ID = " + transformationID + ")";

            grandChildren = children[i].children;
            // Specifications for the current transformation.

            let transfMatrix = mat4.create();

            transfMatrix = this.getTransformations(grandChildren, transfMatrix, transformationID);
            this.transformations[transformationID] = transfMatrix;
        }

        this.log("Parsed transformations");
        return null;
    }

    getTransformations(listOfTransformations, transfMatrix, transformationID) {
        for (var j = 0; j < listOfTransformations.length; j++) {
            let transformation = listOfTransformations[j];
            switch (transformation.nodeName) {
                case 'translate':
                    transfMatrix = this.parseTranslate(transfMatrix, transformation, transformationID);
                    break;
                case 'scale':
                    transfMatrix = this.parseScale(transfMatrix, transformation, transformationID);
                    break;
                case 'rotate':
                    transfMatrix = this.parseRotation(transfMatrix, transformation, transformationID);
                    break;
                default:
                    this.onXMLMinorError("unknown transformation <" + transformation.nodeName + ">");
                    break;
            }
        }
        return transfMatrix;
    }

    parseTranslate(transfMatrix, transformation, transformationID) {
        let coordinates = this.parseCoordinates3D(transformation, "translate transformation for ID " + transformationID);
        if (!Array.isArray(coordinates)) {
            this.onXMLError("Error parsing coordinates '" + coordinates + "' in translate " + transformationID);
            return transfMatrix;
        }

        transfMatrix = mat4.translate(transfMatrix, transfMatrix, coordinates);
        return transfMatrix;
    }

    parseScale(transfMatrix, transformation, transformationID) {
        let parameters = this.parseCoordinates3D(transformation, "scale transformation for ID " + transformationID);
        if (!Array.isArray(parameters)) {
            this.onXMLError("Error parsing parameters '" + parameters + "' in scale " + transformationID);
            return transfMatrix;
        }

        transfMatrix = mat4.scale(transfMatrix, transfMatrix, parameters);
        return transfMatrix;
    }

    parseRotation(transfMatrix, transformation, transformationID) {
        let axis = transformation.getAttribute("axis");
        let angle = parseFloat(transformation.getAttribute("angle"));

        switch(axis) {
            case "X":
            case "x":
                transfMatrix = mat4.rotateX(transfMatrix, transfMatrix, angle*DEGREE_TO_RAD);
                break;
            case "y":
            case "Y":
                transfMatrix = mat4.rotateY(transfMatrix, transfMatrix, angle*DEGREE_TO_RAD);
                break;
            case "z":
            case "Z":
                transfMatrix = mat4.rotateZ(transfMatrix, transfMatrix, angle*DEGREE_TO_RAD);
                break;
            case null:
                //Check if it's the special animation keyframe and rotate accordingly if it's not then return error
                let angle_x = this.reader.getFloat(transformation, "angle_x");
                let angle_y = this.reader.getFloat(transformation, "angle_y");
                let angle_z = this.reader.getFloat(transformation, "angle_z");
                if(angle_x == null || angle_y == null || angle_z == null) {
                    this.onXMLError("Wrong axis type '" + axis + "' in rotation " + transformationID);
                    break;
                }
                
                transfMatrix = mat4.rotateX(transfMatrix, transfMatrix, angle_x*DEGREE_TO_RAD);
                transfMatrix = mat4.rotateY(transfMatrix, transfMatrix, angle_y*DEGREE_TO_RAD);
                transfMatrix = mat4.rotateZ(transfMatrix, transfMatrix, angle_z*DEGREE_TO_RAD);
                break;   
            default:
                this.onXMLError("Unexpected axis '" + axis + "' in rotation " + transformationID);
                break;
        }

        return transfMatrix;
    }

    /**
     * Parses the <primitives> block.
     * @param {primitives block element} primitivesNode
     */
    parsePrimitives(primitivesNode) {
        let children = primitivesNode.children;

        this.primitives = [];

        var grandChildren = [];

        // Any number of primitives.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "primitive") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current primitive.
            var primitiveId = this.reader.getString(children[i], 'id');
            if (primitiveId == null)
                return "no ID defined for texture";

            // Checks for repeated IDs.
            if (this.primitives[primitiveId] != null)
                return "ID must be unique for each primitive (conflict: ID = " + primitiveId + ")";

            grandChildren = children[i].children;

            // Validate the primitive type
            if (grandChildren.length != 1 ||
                (grandChildren[0].nodeName != 'rectangle' && grandChildren[0].nodeName != 'triangle' &&
                    grandChildren[0].nodeName != 'cylinder' && grandChildren[0].nodeName != 'sphere' &&
                    grandChildren[0].nodeName != 'torus')) {
                return "There must be exactly 1 primitive type (rectangle, triangle, cylinder, sphere or torus)"
            }

            // Specifications for the current primitive.
            var primitiveType = grandChildren[0].nodeName;

            // Retrieves the primitive coordinates.
            if (primitiveType == 'rectangle') {
                // x1
                var x1 = this.reader.getFloat(grandChildren[0], 'x1');
                if (!(x1 != null && !isNaN(x1)))
                    return "unable to parse x1 of the primitive coordinates for ID = " + primitiveId;

                // y1
                var y1 = this.reader.getFloat(grandChildren[0], 'y1');
                if (!(y1 != null && !isNaN(y1)))
                    return "unable to parse y1 of the primitive coordinates for ID = " + primitiveId;

                // x2
                var x2 = this.reader.getFloat(grandChildren[0], 'x2');
                if (!(x2 != null && !isNaN(x2) && x2 > x1))
                    return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;

                // y2
                var y2 = this.reader.getFloat(grandChildren[0], 'y2');
                if (!(y2 != null && !isNaN(y2) && y2 > y1))
                    return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;

                var rect = new MyRectangle(this.scene, primitiveId, x1, x2, y1, y2);

                this.primitives[primitiveId] = rect;
            } else if (primitiveType == 'triangle') {
                let x1 = this.reader.getFloat(grandChildren[0], 'x1');
                if (!(x1 != null && !isNaN(x1)))
                    return "unable to parse x1 of the primitive coordinates for ID = " + primitiveId;

                let y1 = this.reader.getFloat(grandChildren[0], 'y1');
                if (!(y1 != null && !isNaN(y1)))
                    return "unable to parse y1 of the primitive coordinates for ID = " + primitiveId;

                let z1 = this.reader.getFloat(grandChildren[0], 'z1');
                if (!(z1 != null && !isNaN(z1)))
                    return "unable to parse z1 of the primitive coordinates for ID = " + primitiveId;

                let x2 = this.reader.getFloat(grandChildren[0], 'x2');
                if (!(x2 != null && !isNaN(x2)))
                    return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;

                let y2 = this.reader.getFloat(grandChildren[0], 'y2');
                if (!(y2 != null && !isNaN(y2)))
                    return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;

                let z2 = this.reader.getFloat(grandChildren[0], 'z2');
                if (!(z2 != null && !isNaN(z2)))
                    return "unable to parse z2 of the primitive coordinates for ID = " + primitiveId;
                
                let x3 = this.reader.getFloat(grandChildren[0], 'x3');
                if (!(x3 != null && !isNaN(x3)))
                    return "unable to parse x3 of the primitive coordinates for ID = " + primitiveId;

                let y3 = this.reader.getFloat(grandChildren[0], 'y3');
                if (!(y3 != null && !isNaN(y3)))
                    return "unable to parse y3 of the primitive coordinates for ID = " + primitiveId;

                let z3 = this.reader.getFloat(grandChildren[0], 'z3');
                if (!(z3 != null && !isNaN(z3)))
                    return "unable to parse z3 of the primitive coordinates for ID = " + primitiveId;

                let triangle = new MyTriangle(this.scene, primitiveId, [x1, y1, z1], [x2, y2, z2], [x3, y3, z3]);

                this.primitives[primitiveId] = triangle;
            } else if (primitiveType == 'sphere') {
                let radius = this.reader.getFloat(grandChildren[0], 'radius');
                if (!(radius != null && !isNaN(radius)))
                    return "unable to parse radius of the primitive coordinates for ID = " + primitiveId;

                let slices = this.reader.getFloat(grandChildren[0], 'slices');
                if (!(slices != null && !isNaN(slices)))
                    return "unable to parse slices of the primitive coordinates for ID = " + primitiveId;

                let stacks = this.reader.getFloat(grandChildren[0], 'stacks');
                if (!(stacks != null && !isNaN(stacks)))
                    return "unable to parse stacks of the primitive coordinates for ID = " + primitiveId;

                let sphere = new MySphere(this.scene, primitiveId, radius, slices, stacks);

                this.primitives[primitiveId] = sphere;
            } else if (primitiveType == 'cylinder') {
                let base = this.reader.getFloat(grandChildren[0], 'base');
                if (!(base != null && !isNaN(base)))
                    return "unable to parse base of the primitive coordinates for ID = " + primitiveId;

                let top = this.reader.getFloat(grandChildren[0], 'top');
                if (!(top != null && !isNaN(top)))
                    return "unable to parse top of the primitive coordinates for ID = " + primitiveId;

                let height = this.reader.getFloat(grandChildren[0], 'height');
                if (!(height != null && !isNaN(height)))
                    return "unable to parse height of the primitive coordinates for ID = " + primitiveId;

                let slices = this.reader.getFloat(grandChildren[0], 'slices');
                if (!(slices != null && !isNaN(slices)))
                    return "unable to parse slices of the primitive coordinates for ID = " + primitiveId;

                let stacks = this.reader.getFloat(grandChildren[0], 'stacks');
                if (!(stacks != null && !isNaN(stacks)))
                    return "unable to parse stacks of the primitive coordinates for ID = " + primitiveId;

                let cylinder = new MyCylinder(this.scene, primitiveId, base, top, height, slices, stacks);

                this.primitives[primitiveId] = cylinder;
            } else if (primitiveType == 'torus') {
                let inner = this.reader.getFloat(grandChildren[0], 'inner');
                if (!(inner != null && !isNaN(inner)))
                    return "unable to parse inner of the primitive coordinates for ID = " + primitiveId;

                let outer = this.reader.getFloat(grandChildren[0], 'outer');
                if (!(outer != null && !isNaN(outer)))
                    return "unable to parse outer of the primitive coordinates for ID = " + primitiveId;

                let slices = this.reader.getFloat(grandChildren[0], 'slices');
                if (!(slices != null && !isNaN(slices)))
                    return "unable to parse slices of the primitive coordinates for ID = " + primitiveId;

                let loops = this.reader.getFloat(grandChildren[0], 'loops');
                if (!(loops != null && !isNaN(loops)))
                    return "unable to parse loops of the primitive coordinates for ID = " + primitiveId;

                let torus = new MyTorus(this.scene, primitiveId, inner, outer, slices, loops);
                
                this.primitives[primitiveId] = torus;
            } else {
                console.warn("To do: Parse other primitives.");
            }
        }

        this.log("Parsed primitives");
        return null;
    }

    /**
   * Parses the <components> block.
   * @param {components block element} componentsNode
   */
    parseComponents(componentsNode) {
        let XMLcomponents = componentsNode.children;

        this.rootComponent;
        this.allComponents = [];

        var grandChildren = [];
        var grandgrandChildren = [];
        var nodeNames = [];

        function checkIfLengthsProvided(textureNode) { //Checks if there are any length_S and length_t attributes where there shouldn't be
            for(let i = 0; i < textureNode.attributes.length; i++) {
                let att = textureNode.attributes[i];
                if(att.nodeName == "length_s")
                    this.onXMLMinorError("length_s not supposed to exist in inherit texture for component " + componentID);
                else if(att.nodeName == "length_t")
                    this.onXMLMinorError("length_t not supposed to exist in inherit texture for component " + componentID);
            }
        }

        // Any number of components.
        for (var i = 0; i < XMLcomponents.length; i++) {

            if (componentsNode.children[i].nodeName != "component") {
                this.onXMLMinorError("unknown tag <" + XMLcomponents[i].nodeName + ">");
                continue;
            }

            // Get id of the current component.
            var componentID = this.reader.getString(XMLcomponents[i], 'id');
            if (componentID == null)
                return "no ID defined for componentID";

            grandChildren = XMLcomponents[i].children;

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            var transformationIndex = nodeNames.indexOf("transformation");
            var materialsIndex = nodeNames.indexOf("materials");
            var textureIndex = nodeNames.indexOf("texture");
            var childrenIndex = nodeNames.indexOf("children");
            let animationRefIndex = nodeNames.indexOf("animationref");

            // TRANSFORMATIONS
            let matrix = mat4.create(); //matrix where the transformatiosn are stored

            grandgrandChildren = grandChildren[transformationIndex].children;

            //creates transformation matrix
            for (let j = 0; j < grandgrandChildren.length; j++) {
                let transformation = grandgrandChildren[j];
                switch (transformation.nodeName) {
                    case 'translate':
                        matrix = this.parseTranslate(matrix, transformation, "Component: " + componentID);
                        break;
                    case 'scale':
                        matrix = this.parseScale(matrix, transformation, "Component: " + componentID);
                        break;
                    case 'rotate':
                        matrix = this.parseRotation(matrix, transformation, "Component: " + componentID);
                        break;
                    case 'transformationref':
                        let transID = this.reader.getString(transformation, "id");
                        if(this.transformations[transID] == null) {
                            this.onXMLMinorError("transformationref '" + transID + "' doesn't exist.");
                        }
                        matrix = mat4.multiply(matrix, matrix, this.transformations[transID]);
                        break;
                    default:
                        this.onXMLMinorError("unknown transformation <" + transformation.nodeName + ">");
                        break;
                }
            }

            //ANIMATION_REF
            let animRef = this.reader.getString(grandChildren[animationRefIndex], "id");
            let animation = null;
            if(animRef !== null) animation = this.animations[animRef];

            // MATERIALS
            grandgrandChildren = grandChildren[materialsIndex].children;

            let componentMaterials = [];

            for (let j = 0; j < grandgrandChildren.length; j++) {
                let material = grandgrandChildren[j];
                if(material.nodeName != "material") {
                    this.onXMLMinorError("unknown material <" + material.nodeName + ">");
                    continue;
                }

                let matID = this.reader.getString(material, "id");
                if(matID == null) {
                    this.onXMLMinorError("no ID defined for material in component: " + componentID);
                    continue;
                }
                else if(matID == "inherit") {
                    componentMaterials.push("inherit");
                }
                else if(!this.materials[matID]) {
                    this.onXMLError("material with ID " + matID + " in component: " + componentID + " doesn't exist");
                    return null;
                }
                else componentMaterials.push(this.materials[matID]);
            }

            if (componentMaterials.length == 0)
                this.onXMLError("No material in component " + componentID);

            let materials = {current: 0, materials: componentMaterials};

            // TEXTURE
            let textureNode = grandChildren[textureIndex];

            let tex = "";
            let texture;

            let texID = this.reader.getString(textureNode, "id");
            if(texID == null) {
                this.onXMLError("No texture ID in component " + componentID);
                return null;
            }
            else if(texID == "inherit") {
                tex = "inherit";
                texture = {texture: tex};

                //Testing fot unecessary length_s and length_t
                checkIfLengthsProvided.call(this, textureNode);
            }
            else if(texID == "none") {
                tex = null;
                texture = {texture: tex};

                //Testing fot unecessary length_s and length_t
                checkIfLengthsProvided.call(this, textureNode);
            }
            else if(this.textures[texID] == null) {
                this.onXMLError("Texture with ID " + matID + " in component: " + componentID + " doesn't exist");
                return null;
            }
            else {
                tex = this.textures[texID];

                let length_s = this.reader.getFloat(textureNode, "length_s");
                let length_t = this.reader.getFloat(textureNode, "length_t");
                if(length_s == null) {
                    this.onXMLMinorError("length_s not provided in texture for component " + componentID);
                    length_s = 1.0;
                }
                if(length_t == null) {
                    this.onXMLMinorError("length_t not provided in texture for component " + componentID);
                    length_t = 1.0;
                }

                texture = {texture: tex, length_s: length_s, length_t: length_t};
            }

            // CHILDREN
            grandgrandChildren = grandChildren[childrenIndex].children;

            let children = [];

            for(let i = 0; i < grandgrandChildren.length; i++) {
                let child = grandgrandChildren[i];
                let object;

                switch(child.nodeName) {
                    case 'componentref':
                        let childID = this.reader.getString(child, "id");
                        if(childID == null) {
                            this.onXMLError("componentref in component " + componentID + " doesn't have an ID");
                            continue;
                        }
                        else if(this.allComponents[childID] != null) {
                            object = this.allComponents[childID];
                        }
                        else {
                            this.allComponents[childID] = new MyComponent(false);
                            object = this.allComponents[childID];
                        }

                        break;
                    case 'primitiveref':
                        let id = this.reader.getString(child, "id");
                        if(id == null) {
                            this.onXMLError("primitiveref child in component " + componentID + " doesn't have an ID");
                            continue;
                        }
                        else if(this.primitives[id] != null) {
                            object = this.primitives[id];
                        }
                        else {
                            this.onXMLError("primitiveref child in component " + componentID + " with ID '" + id + "' doesn't exist");
                            continue;
                        }
                        break;
                    default:
                        this.onXMLMinorError("unknown tag <" + child.nodeName + ">");
                        break;
                }

                children.push(object);
            }

            if(this.allComponents[componentID] == null) {
                let newComponent = new MyComponent(true, matrix, materials, texture, children, this.scene, animation);
                this.allComponents[componentID] = newComponent;
            }
            else
                this.allComponents[componentID].initialize(matrix, materials, texture, children, this.scene, animation);

            if(componentID === this.idRoot) {
                this.rootComponent = this.allComponents[componentID];
            }
        }
        
        //check if any component is not loaded.
        for(let component in this.allComponents) {
            if(!this.allComponents[component].isLoaded()) {
                this.onXMLMinorError("Compoenent with id '" + component + "' has been referenced but doesn't exist");
            }
        }
    }
    
    /**
    *
    */
    parseAnimations(animationsNode) {
        this.animations = []; //List of all animations (can be empty)
                              //Each animation is composed of an ID and a list of keyframes
                              //Each keyframe is composed of an instant and a matrix

        let animationsList = animationsNode.children;
        for(let i = 0; i < animationsList.length; i++) {
            let animation = animationsList[i];
            let animObj = this.parseAnimation(animation);
            this.animations[animObj.id] = animObj;
        }
    }

    parseAnimation(animation) {
        let animationID = this.reader.getString(animation, "id");
        let keyframes = animation.children;
        if(keyframes.length < 1) this.onXMLError("No keuframes in animation: " + animationID); //throw error There needs to be at least one keyframe

        let keyframeList = [];

        function getTransObj(listOfTransformations, obj) {
            let transObj = {};

            for (let j = 0; j < listOfTransformations.length; j++) {
                let transformation = listOfTransformations[j];
                switch (transformation.nodeName) {
                    case 'translate':
                        let transX = obj.reader.getFloat(transformation, "x");
                        let transY = obj.reader.getFloat(transformation, "y");
                        let transZ = obj.reader.getFloat(transformation, "z");
                        transObj.translate = {x: transX, y: transY, z: transZ};
                        break;
                    case 'scale':
                        let scaleX = obj.reader.getFloat(transformation, "x");
                        let scaleY = obj.reader.getFloat(transformation, "y");
                        let scaleZ = obj.reader.getFloat(transformation, "z");
                        transObj.scale = {x: scaleX, y: scaleY, z: scaleZ};
                        break;
                    case 'rotate':
                        let angX = obj.reader.getFloat(transformation, "angle_x");
                        let angY = obj.reader.getFloat(transformation, "angle_y");
                        let angZ = obj.reader.getFloat(transformation, "angle_z");
                        transObj.rotate = {x: angX, y: angY, z: angZ};
                        break;
                    default:
                        obj.onXMLMinorError("unknown transformation '" + transformation.nodeName + "' in keyframe!");
                        break;
                }
            }

            return transObj;
        }

        for(let j = 0; j < keyframes.length; j++) {
            let keyframe = keyframes[j];

            let keyframeInstant = this.reader.getFloat(keyframe, "instant");

            let transformations = keyframe.children;

            let transObj = getTransObj(transformations, this);

            let keyframeObj = {instant: keyframeInstant, transforms: transObj};
            keyframeList.push(keyframeObj);            
        }

        let animObj = {id: animationID, keyframes: keyframeList};
        return animObj;
    }


    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates3D(node, messageError) {
        var position = [];

        // x
        var x = this.reader.getFloat(node, 'x');
        if (!(x != null && !isNaN(x)))
            return "unable to parse x-coordinate of the " + messageError;

        // y
        var y = this.reader.getFloat(node, 'y');
        if (!(y != null && !isNaN(y)))
            return "unable to parse y-coordinate of the " + messageError;

        // z
        var z = this.reader.getFloat(node, 'z');
        if (!(z != null && !isNaN(z)))
            return "unable to parse z-coordinate of the " + messageError;

        position.push(...[x, y, z]);

        return position;
    }

    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates4D(node, messageError) {
        var position = [];

        //Get x, y, z
        position = this.parseCoordinates3D(node, messageError);

        if (!Array.isArray(position))
            return position;


        // w
        var w = this.reader.getFloat(node, 'w');
        if (!(w != null && !isNaN(w)))
            return "unable to parse w-coordinate of the " + messageError;

        position.push(w);

        return position;
    }

    /**
     * Parse the color components from a node
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseColor(node, messageError) {
        var color = [];

        // R
        var r = this.reader.getFloat(node, 'r');
        if (!(r != null && !isNaN(r) && r >= 0 && r <= 1))
            return "unable to parse R component of the " + messageError;

        // G
        var g = this.reader.getFloat(node, 'g');
        if (!(g != null && !isNaN(g) && g >= 0 && g <= 1))
            return "unable to parse G component of the " + messageError;

        // B
        var b = this.reader.getFloat(node, 'b');
        if (!(b != null && !isNaN(b) && b >= 0 && b <= 1))
            return "unable to parse B component of the " + messageError;

        // A
        var a = this.reader.getFloat(node, 'a');
        if (!(a != null && !isNaN(a) && a >= 0 && a <= 1))
            return "unable to parse A component of the " + messageError;

        color.push(...[r, g, b, a]);

        return color;
    }

    /*
     * Callback to be executed on any read error, showing an error on the console.
     * @param {string} message
     */
    onXMLError(message) {
        console.error("XML Loading Error: " + message);
        this.loadedOk = false;
    }

    /**
     * Callback to be executed on any minor error, showing a warning on the console.
     * @param {string} message
     */
    onXMLMinorError(message) {
        console.warn("Warning: " + message);
    }

    /**
     * Callback to be executed on any message.
     * @param {string} message
     */
    log(message) {
        console.log("   " + message);
    }

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {
        this.rootComponent.display(this.scene);
    }

    nextMat(component) {
        let length = component.materials.materials.length;
        let number = component.materials.current + 1;
        if(number >= length) number = 0;
        component.materials.current = number;
    }
}