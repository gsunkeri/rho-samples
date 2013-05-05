App = Ember.Application.create({
    LOG_TRANSITIONS: true,
    productModel: Rho.ORM.addModel('Product'),
    customerModel: Rho.ORM.addModel('Customer')
});

if (App.productModel.find('all').length == 0) {
    App.productModel.create({name: "Galaxy S3", sku: '5678', brand: 'Samsung', price: 199, quantity: 2 });
    App.productModel.create({name: "iPhone 5", sku: '1234', brand: 'Apple', price: 219, quantity: 3 });
}

if (App.customerModel.find('all').length == 0) {
    App.customerModel.create({first: "Tim", last: "Cook", email: "tim@apple.com", phone: "+1234567890", address: "1 Infinity Loop", city: 'Cupertino' });
    App.customerModel.create({first: "Bill", last: "Gates", email: "bill@microsoft.com", phone: "+0987654321", address: "Blue screen of death", city: 'Redmond' });
}

ProductProxy = Ember.Object.extend({

    object: function () {
        return this.subject.get('object');
    }.property('subject'),

    name: function () {
        return this.subject.get('name');
    }.property('subject'),

    sku: function () {
        return this.subject.get('sku');
    }.property('subject'),

    brand: function () {
        return this.subject.get('brand');
    }.property('subject'),

    price: function () {
        return this.subject.get('price');
    }.property('subject'),

    quantity: function () {
        return this.subject.get('quantity');
    }.property('subject')

});

CustomerProxy = Ember.Object.extend({

    object: function () {
        return this.subject.get('object');
    }.property('subject'),

    first: function () {
        return this.subject.get('first');
    }.property('subject'),

    last: function () {
        return this.subject.get('last');
    }.property('subject'),

    email: function () {
        return this.subject.get('email');
    }.property('subject'),

    phone: function () {
        return this.subject.get('phone');
    }.property('subject'),

    address: function () {
        return this.subject.get('address');
    }.property('subject'),

    city: function () {
        return this.subject.get('city');
    }.property('subject')

});

App.Router.map(function () {
    this.route('welcome');
    this.route('login');
    this.route('home');
    this.resource('products', function () {
        this.resource('product', {path: ":product_id"}, function () {
            this.route('edit');
            this.route('delete');
        });
        this.route('new');
    });
    this.resource('customers', function () {
        this.resource('customer', {path: ":customer_id"}, function () {
            this.route('edit');
            this.route('delete');
        });
        this.route('new');
    });
});

App.IndexRoute = Ember.Route.extend({
    redirect: function () {
        this.transitionTo("home");
    }
});

App.WelcomeController = Ember.Controller.extend({
    goLogin: function () {
        this.transitionToRoute('login')
    }
});


App.LoginController = Ember.Controller.extend({
    doLogin: function (login, password) {
        var thisController = this;
        Rho.RhoConnectClient.login(login, password, function (value) {
            if (value.error_code == 0) {
                thisController.transitionToRoute('home');
            } else {
                thisController.transitionToRoute('login');
            }
        });
    }
});

App.LoginFormView = Ember.View.extend({
    tagName: 'form',
    login: null,
    password: null,

    submit: function (event) {
        event.preventDefault();
        var login = this.get('login');
        var password = this.get('password');
        this.get('controller').doLogin(login, password)
    }
});

App.HomeRoute = Ember.Route.extend({
    events: {
        doLogout: function () {
            Rho.RhoConnectClient.logout();
            this.controller.transitionToRoute('welcome');
        },
        doSync: function () {/* doSync */
        },
        goProducts: function () {
            this.controller.transitionToRoute('products.index')
        },
        goCustomers: function () {
            this.controller.transitionToRoute('customers.index')
        }        }
});

App.ProductsIndexRoute = Ember.Route.extend({
    model: function (params) {
        var _readedProducts = App.productModel.find('all');
        var _products = [];
        for (var i = 0; i < _readedProducts.length; i++) {
            var _productProxy = ProductProxy.create({subject: _readedProducts[i]});
            _products.pushObject(_productProxy);
        }
        return {products: _products}
    },
    events: {
        home: function () {
            this.controller.transitionToRoute('home')
        },
        doNewProduct: function () {
            this.controller.transitionToRoute('products.new')
        }
    }
});

App.ProductRoute = Ember.Route.extend({
    model: function (params) {
        // need return concrete product, but method "find" not supports select criteria now
        var _productProxy = null;
        var _products = App.productModel.find('all');
        for (var i = 0; i < _products.length; i++) {
            if (_products[i].get('object') == params.product_id) {
                _productProxy = ProductProxy.create({subject: _products[i]});
            }
        }
        return  _productProxy;
    },
    serialize: function (product) {
        return {product_id: product.get('object')}
    },
    setupController: function (controller, model) {
        controller.set('model', model);
    },
    events: {
        back: function () {
            this.controller.transitionToRoute('products.index');
        },

        doEditProduct: function (params) {
            this.controller.transitionToRoute('product.edit', params);
        }
    }
});

App.ProductEditRoute = Ember.Route.extend({
    model: function (params) {
        return this.modelFor('product')
    },
    serialize: function (product) {
        return {product_id: product.get('object')}
    },
    setupController: function (controller, model) {
        controller.set('model', model);
    },
    events: {
        doDeleteProduct: function (params) {
            alert("This stub while method destroy() don't work");
            //params.subject.destroy();
            this.controller.transitionToRoute('products.index');
        },
        doCancel: function (params) {
            this.controller.transitionToRoute('product', params)
        }
    }
});

App.NewProductFormView = Ember.View.extend({
    tagName: 'form',
    brand: null,
    name: null,
    sku: null,
    price: null,
    quantity: null,
    submit: function (event) {
        event.preventDefault();
        var brand = this.get('brand');
        var name = this.get('name');
        var sku = this.get('sku');
        var price = this.get('price');
        var quantity = this.get('quantity');
        App.productModel.create({name: name, brand: brand, sku: sku, price: price, quantity: quantity})
        this.get('controller').transitionToRoute('products.index')
    }
});

App.EditProductFormView = Ember.View.extend({
    tagName: 'form',
    brand: null,
    name: null,
    sku: null,
    price: null,
    quantity: null,
    willInsertElement: function () {
        var object = this.get('controller').get('model').subject;
        this.set('brand', object.get('brand'));
        this.set('name', object.get('name'));
        this.set('sku', object.get('sku'));
        this.set('price', object.get('price'));
        this.set('quantity', object.get('quantity'));
    },

    submit: function (event) {
        event.preventDefault();
        var object = this.get('controller').get('model').subject;
        object.set('brand', this.get('brand'));
        object.set('name', this.get('name'));
        object.set('sku', this.get('sku'));
        object.set('price', this.get('price'));
        object.set('quantity', this.get('quantity'));
        //TODO: remove comment when ORM support method "save()"
        //object.save();
        this.get('controller').transitionToRoute('product', this.get('controller').get('model'))
    }
});

App.ProductIndexController = Ember.ObjectController.extend({
    needs: ['product']
});

App.ProductController = Ember.ObjectController.extend({
    needs: ['product']
});

App.ProductEditController = Ember.ObjectController.extend({
    needs: ['product']
});

App.ProductDeleteController = Ember.ObjectController.extend({
    needs: ['product']
});

/* ++++++++++++++++++++++++++++++++++++ */

App.CustomersIndexRoute = Ember.Route.extend({
    model: function (params) {
        var _readedCustomers = App.customerModel.find('all');
        var _customers = [];
        for (var i = 0; i < _readedCustomers.length; i++) {
            var _customerProxy = CustomerProxy.create({subject: _readedCustomers[i]});
            _customers.pushObject(_customerProxy);
        }
        return {customers: _customers}
    },
    events: {
        home: function () {
            this.controller.transitionToRoute('home')
        },
        doNewCustomer: function () {
            this.controller.transitionToRoute('customers.new')
        }
    }
});

App.CustomerRoute = Ember.Route.extend({
    model: function (params) {
        // need return concrete product, but method "find" not supports select criteria now
        var _customerProxy = null;
        var _customers = App.customerModel.find('all');
        for (var i = 0; i < _customers.length; i++) {
            if (_customers[i].get('object') == params.customer_id) {
                _customerProxy = CustomerProxy.create({subject: _customers[i]});
            }
        }
        return  _customerProxy;
    },
    serialize: function (customer) {
        return {customer_id: customer.get('object')}
    },
    setupController: function (controller, model) {
        controller.set('model', model);
    },
    events: {
        back: function () {
            this.controller.transitionToRoute('customers.index');
        },

        doEditCustomer: function (params) {
            this.controller.transitionToRoute('customer.edit', params);
        }
    }
});

App.CustomerEditRoute = Ember.Route.extend({
    model: function (params) {
        return this.modelFor('customer')
    },
    serialize: function (customer) {
        return {customer_id: customer.get('object')}
    },
    setupController: function (controller, model) {
        controller.set('model', model);
    },
    events: {
        doDeleteCustomer: function (params) {
            alert("This stub while method destroy() don't work");
            //params.subject.destroy();
            this.controller.transitionToRoute('customers.index');
        },
        doCancel: function (params) {
            this.controller.transitionToRoute('customer', params)
        }
    }
});

App.NewCustomerFormView = Ember.View.extend({
    tagName: 'form',
    first: null,
    last: null,
    email: null,
    phone: null,
    address: null,
    city: null,
    submit: function (event) {
        event.preventDefault();
        var newCustomer = {};
        newCustomer.first = this.get('first');
        newCustomer.last = this.get('last');
        newCustomer.email = this.get('email');
        newCustomer.phone = this.get('phone');
        newCustomer.address = this.get('address');
        newCustomer.city = this.get('city');
        App.customerModel.create(newCustomer);
        this.get('controller').transitionToRoute('customers.index')
    }
});

App.EditCustomerFormView = Ember.View.extend({
    tagName: 'form',
    first: null,
    last: null,
    email: null,
    phone: null,
    address: null,
    city: null,
    willInsertElement: function () {
        var object = this.get('controller').get('model').subject;
        this.set('first', object.get('first'));
        this.set('last', object.get('last'));
        this.set('email', object.get('email'));
        this.set('phone', object.get('phone'));
        this.set('address', object.get('address'));
        this.set('city', object.get('city'));
    },

    submit: function (event) {
        event.preventDefault();
        var object = this.get('controller').get('model').subject;
        object.set('first', this.get('first'));
        object.set('last', this.get('last'));
        object.set('email', this.get('email'));
        object.set('phone', this.get('phone'));
        object.set('address', this.get('address'));
        object.set('city', this.get('city'));
        //TODO: remove comment when ORM support method "save()"
        //object.save();
        this.get('controller').transitionToRoute('customer', this.get('controller').get('model'))
    }
});

App.CustomerIndexController = Ember.ObjectController.extend({
    needs: ['customer']
});

App.CustomerController = Ember.ObjectController.extend({
    needs: ['customer']
});

App.CustomerEditController = Ember.ObjectController.extend({
    needs: ['customer']
});

App.CustomerDeleteController = Ember.ObjectController.extend({
    needs: ['customer']
});
