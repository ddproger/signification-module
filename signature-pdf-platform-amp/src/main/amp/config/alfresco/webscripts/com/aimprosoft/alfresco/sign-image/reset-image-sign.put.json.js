/**
 * User Profile - Reset user signature REST method
 * 
 * Current user can only modify their own settings.
 * 
 * @method PUT
 */

function main()
{
   var userName = url.extension;
   var user = people.getPerson(userName);
   if (user == null)
   {
      status.setCode(status.STATUS_NOT_FOUND, "Person " + userName + " does not exist");
      return;
   }
   
   if (user == null ||
       (people.isAdmin(person) == false && user.properties.userName != person.properties.userName))
   {
      status.code = 500;
      status.message = msg.get("error.failed");
      status.redirect = true;
      return;
   }
   
   var assocs = user.childAssocs["cm:preferenceSignImage"];
   if (assocs != null && assocs.length == 1)
   {
      assocs[0].remove();
   }
   assocs = user.associations["cm:signImage"];
   if (assocs != null && assocs.length == 1)
   {
      user.removeAssociation(assocs[0], "cm:signImage");
   }
   
   model.success = true;
}

main();
