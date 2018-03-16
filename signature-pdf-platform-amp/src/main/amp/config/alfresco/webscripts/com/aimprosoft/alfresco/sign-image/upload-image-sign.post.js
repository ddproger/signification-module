/**
 * User Profile ESign Upload method
 *
 * @method POST
 * @param username {string}
 *        filedata {file}
 */

function main() {
    try {
        var filename = null;
        var content = null;
        var username = null;

        // locate file attributes
        for each(field in formdata.fields)
        {
            if (field.name == "filedata" && field.isFile) {
                filename = field.filename;
                content = field.content;
            }
            else if (field.name == "username") {
                username = field.value;
            }
        }

        if (filename == undefined || content == undefined) {
            status.code = 400;
            status.message = msg.get("error.noFile");
            status.redirect = true;
            return;
        }
        if (username == null || username.length == 0) {
            status.code = 500;
            status.message = msg.get("error.noUsername");
            status.redirect = true;
            return;
        }

        var user = people.getPerson(username);
        // ensure we found a valid user and that it is the current user or we are an admin
        if (user == null ||
            (people.isAdmin(person) == false && user.properties.userName != person.properties.userName)) {
            status.code = 500;
            status.message = msg.get("error.user");
            status.redirect = true;
            return;
        }

        if (!user.hasAspect("cm:preferencesSignImage")) {
            user.addAspect("cm:preferencesSignImage");
        }

        var assocs = user.childAssocs["cm:preferencesSignImage"];
        if (assocs != null && assocs.length == 1) {
            assocs[0].remove();
        }

        var image = user.createNode(filename, "cm:content", "cm:preferencesSignImage");
        image.properties.content.write(content);
        image.properties.content.guessMimetype(filename);

        if (image.properties.content.getMimetype().indexOf("image/") != 0) {
            user.removeNode(image);
            status.code = 500;
            status.message = msg.get("error.notImage");
            status.redirect = true;
            return;
        }

        image.properties.content.encoding = "UTF-8";
        image.save();

        assocs = user.associations["cm:signImage"];
        if (assocs != null && assocs.length == 1) {
            user.removeAssociation(assocs[0], "cm:signImage");
        }
        user.createAssociation(image, "cm:signImage");

        model.image = image;
    }
    catch (e) {
        var x = e;
        status.code = 500;
        status.message = msg.get("error.unexpected");
        if (x.message && x.message.indexOf("org.alfresco.service.cmr.usage.ContentQuotaException") == 0) {
            status.code = 413;
            status.message = x.message;
        }
        status.redirect = true;
        return;
    }
}

main();