/**
 * User Profile - User signature image GET method
 *
 * Returns a user signature image in the format specified by the thumbnailname, or the "signature" preset if omitted.
 *
 * @method GET
 */

function getPlaceholder(thumbnailName)
{
    var phPath = thumbnailService.getMimeAwarePlaceHolderResourcePath(thumbnailName, "image/png");
    if (phPath == null)
    {
        status.setCode(status.STATUS_NOT_FOUND, "Thumbnail was not found and no place holder resource set for '" + thumbnailName + "'");
        return;
    }
    return phPath;
}

function main()
{
    var userName = url.templateArgs.username,
        thumbnailName = url.templateArgs.thumbnailname || "signature",
        signImageNode;

    if (userName == null && url.templateArgs.store_type == null && url.templateArgs.store_id == null && url.templateArgs.id == null)
    {
        model.contentPath = getPlaceholder(thumbnailName);
        model.allowBrowserToCache = "true";
        return;
    }
    else if (url.templateArgs.store_type == null && url.templateArgs.store_id == null && url.templateArgs.id == null)
    {
        var person = people.getPerson(userName);
        if (person == null)
        {
            model.contentPath = getPlaceholder(thumbnailName);
            return;
        }
        else
        {
            // Retrieve the esign NodeRef for this person, if there is one.
            var isignAssoc = person.assocs["cm:signImage"];
            if (isignAssoc != null)
            {
                signImageNode = isignAssoc[0];
            }
        }
    }
    else if (userName == null)
    {
        model.allowBrowserToCache = "true";
        signImageNode = search.findNode(url.templateArgs.store_type + "://" + url.templateArgs.store_id + "/" + url.templateArgs.id);
        if (signImageNode == null)
        {
            model.contentPath = getPlaceholder(thumbnailName);
            return;
        }
    }

    if (signImageNode != null)
    {
        var thumbnail = signImageNode.getThumbnail(thumbnailName);
        if (thumbnail == null || thumbnail.size == 0)
        {
            if (thumbnail != null)
            {
                thumbnail.remove();
            }

            thumbnail = signImageNode.createThumbnail(thumbnailName, false);
            if (thumbnail != null)
            {
                model.contentNode = thumbnail;
                return;
            }
        }
        else
        {
            model.contentNode = thumbnail;
            return;
        }
    }
    model.contentPath = getPlaceholder(thumbnailName);
}

main();