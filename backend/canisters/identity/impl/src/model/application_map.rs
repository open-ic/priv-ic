use crate::internet_identity::get_principal;
use std::collections::hash_map::Entry::{Occupied, Vacant};
use std::collections::{HashMap, HashSet};
use types::{AppUserId, AttributeId, UserId};

#[derive(Default)]
pub struct ApplicationMap {
    apps_by_user: HashMap<UserId, HashMap<String, AppUserId>>,
    app_user_to_user: HashMap<AppUserId, UserId>,
    app_attributes: HashMap<AppUserId, HashSet<AttributeId>>,
}

impl ApplicationMap {
    pub fn user_id(&self, app_user_id: &AppUserId) -> Option<&UserId> {
        self.app_user_to_user.get(app_user_id)
    }

    pub fn register(&mut self, user_id: UserId, domain_name: String) -> Option<AppUserId> {
        let app_user_id = Self::derive_app_user_id(user_id, &domain_name);

        // Insert a user if it doesn't exist or get current set of application domains
        let user_apps = match self.apps_by_user.entry(user_id) {
            Occupied(e) => e.into_mut(),
            Vacant(e) => e.insert(HashMap::default()),
        };

        // Insert the application and return false if it is already registered
        if user_apps.insert(domain_name, app_user_id).is_some() {
            return None;
        }

        self.app_attributes.insert(app_user_id, HashSet::new());
        self.app_user_to_user.insert(app_user_id, user_id);
        Some(app_user_id)
    }

    pub fn set_attributes(
        &mut self,
        user_id: UserId,
        domain_name: String,
        attributes: Vec<AttributeId>,
    ) {
        // If the app has not already been registered then register it now
        let app_user_id = match self.lookup_app_user_id(&user_id, &domain_name) {
            None => self.register(user_id, domain_name).unwrap(),
            Some(auid) => *auid,
        };

        let attribute_set = attributes.iter().cloned().collect();
        self.app_attributes.insert(app_user_id, attribute_set);
    }

    pub fn remove_attribute(&mut self, user_id: &UserId, attribute_id: &AttributeId) {
        let user_app_ids = match self.apps_by_user.get(user_id) {
            None => return,
            Some(apps) => apps.values(),
        };

        for user_app_id in user_app_ids {
            if let Some(attributes) = self.app_attributes.get_mut(user_app_id) {
                attributes.remove(attribute_id);
            }
        }
    }

    pub fn domains(&self, user_id: UserId) -> Vec<String> {
        match self.apps_by_user.get(&user_id) {
            None => Vec::default(),
            Some(apps) => apps.keys().cloned().collect(),
        }
    }

    pub fn attributes_by_id(&self, app_user_id: &AppUserId) -> Option<&HashSet<AttributeId>> {
        let registered = self.app_user_to_user.contains_key(app_user_id);
        if !registered {
            return None;
        }

        let attributes = match self.app_attributes.get(app_user_id) {
            None => return None,
            Some(attrs) => attrs,
        };

        Some(attributes)
    }

    pub fn attributes(
        &self,
        user_id: &UserId,
        domain_name: String,
    ) -> Option<&HashSet<AttributeId>> {
        let app_user_id = match self.lookup_app_user_id(user_id, &domain_name) {
            None => return None,
            Some(auid) => auid,
        };

        self.attributes_by_id(app_user_id)
    }

    fn lookup_app_user_id(&self, user_id: &UserId, domain_name: &str) -> Option<&AppUserId> {
        match self.apps_by_user.get(user_id) {
            None => None,
            Some(apps) => apps.get(domain_name),
        }
    }

    #[allow(clippy::ptr_arg)]
    fn derive_app_user_id(user_id: UserId, domain_name: &String) -> AppUserId {
        get_principal(user_id.into(), domain_name).into()
    }
}
