jQuery.fn.ratings = function(stars, initialRating) {

    //Save  the jQuery object for later use.
    var elements = this;

    //Go through each object in the selector and create a ratings control.
    return this.each( function() {

        //Make sure intialRating is set.
        if(!initialRating)
            initialRating = 0;

        //Save the current element for later use.
        var containerElement = this;

        //grab the jQuery object for the current container div
        var container = jQuery(this);

        //Create an array of stars so they can be referenced again.
        var starsCollection = Array();

        //Save the initial rating.
        containerElement.rating = initialRating;

        //Set the container div's overflow to auto.  This ensure it will grow to
        //hold all of its children.
        container.css('overflow', 'auto');

        //create each star
        for(var starIdx = 0; starIdx < stars; starIdx++) {

            //Create a div to hold the star.
            var starElement = document.createElement('div');
            //Get a jQuery object for this star.
            var star = jQuery(starElement);

            //Store the rating that represents this star.
            starElement.rating = starIdx + 1;
            

            //Add the style.
            star.addClass('jquery-ratings-star');

            //Add the full css class if the star is beneath the initial rating.
            if(starIdx < initialRating) {
                star.addClass('jquery-ratings-full');
            }

            //add the star to the container
            container.append(star);
            starsCollection.push(star);

            //hook up the click event
            star.click( function() {
                //set the containers rating
                if (containerElement.rating == this.rating) {
                    containerElement.rating = 0;
                } else {
                    containerElement.rating = this.rating;
                }

                //When clicked, fire the 'ratingchanged' event handler.
                //Pass the rating through as the data argument.
                elements.triggerHandler("ratingchanged", {rating: containerElement.rating});
            });
            star.mouseenter( function() {
                //Highlight selected stars.
                for(var index = 0; index < this.rating; index++) {
                    starsCollection[index].addClass('jquery-ratings-full');
                }
                //Unhighlight unselected stars.
                for(var index = this.rating; index < stars; index++) {
                    starsCollection[index].removeClass('jquery-ratings-full');
                }
            });
            container.mouseleave( function() {
                //Highlight selected stars.
                for(var index = 0; index < containerElement.rating; index++) {
                    starsCollection[index].addClass('jquery-ratings-full');
                }
                //Unhighlight unselected stars.
                for(var index = containerElement.rating; index < stars ; index++) {
                    starsCollection[index].removeClass('jquery-ratings-full');
                }
            });
        }
    });
};
/*
 * jQuery validation plug-in pre-1.5.2
 *
 * http://bassistance.de/jquery-plugins/jquery-plugin-validation/
 * http://docs.jquery.com/Plugins/Validation
 *
 * Copyright (c) 2006 - 2008 Jörn Zaefferer
 *
 * $Id: jquery.validate.js 6243 2009-02-19 11:40:49Z joern.zaefferer $
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */

(function($) {

    $.extend($.fn, {
        // http://docs.jquery.com/Plugins/Validation/validate
        validate: function( options ) {

            // if nothing is selected, return nothing; can't chain anyway
            if (!this.length) {
                options && options.debug && window.console && console.warn( "nothing selected, can't validate, returning nothing" );
                return;
            }

            // check if a validator for this form was already created
            var validator = $.data(this[0], 'validator');
            if ( validator ) {
                return validator;
            }

            validator = new $.validator( options, this[0] );
            $.data(this[0], 'validator', validator);

            if ( validator.settings.onsubmit ) {

                // allow suppresing validation by adding a cancel class to the submit button
                this.find("input, button").filter(".cancel").click( function() {
                    validator.cancelSubmit = true;
                });
                // validate the form on submit
                this.submit( function( event ) {
                    if ( validator.settings.debug )
                        // prevent form submit to be able to see console output
                        event.preventDefault();

                    function handle() {
                        if ( validator.settings.submitHandler ) {
                            validator.settings.submitHandler.call( validator, validator.currentForm );
                            return false;
                        }
                        return true;
                    }

                    // prevent submit for invalid forms or custom submit handlers
                    if ( validator.cancelSubmit ) {
                        validator.cancelSubmit = false;
                        return handle();
                    }
                    if ( validator.form() ) {
                        if ( validator.pendingRequest ) {
                            validator.formSubmitted = true;
                            return false;
                        }
                        return handle();
                    } else {
                        validator.focusInvalid();
                        return false;
                    }
                });
            }

            return validator;
        },
        // http://docs.jquery.com/Plugins/Validation/valid
        valid: function() {
            if ( $(this[0]).is('form')) {
                return this.validate().form();
            } else {
                var valid = false;
                var validator = $(this[0].form).validate();
                this.each( function() {
                    valid |= validator.element(this);
                });
                return valid;
            }
        },
        // attributes: space seperated list of attributes to retrieve and remove
        removeAttrs: function(attributes) {
            var result = {},
            $element = this;
            $.each(attributes.split(/\s/), function(index, value) {
                result[value] = $element.attr(value);
                $element.removeAttr(value);
            });
            return result;
        },
        // http://docs.jquery.com/Plugins/Validation/rules
        rules: function(command, argument) {
            var element = this[0];

            if (command) {
                var settings = $.data(element.form, 'validator').settings;
                var staticRules = settings.rules;
                var existingRules = $.validator.staticRules(element);
                switch(command) {
                    case "add":
                        $.extend(existingRules, $.validator.normalizeRule(argument));
                        staticRules[element.name] = existingRules;
                        if (argument.messages)
                            settings.messages[element.name] = $.extend( settings.messages[element.name], argument.messages );
                        break;
                    case "remove":
                        if (!argument) {
                            delete staticRules[element.name];
                            return existingRules;
                        }
                        var filtered = {};
                        $.each(argument.split(/\s/), function(index, method) {
                            filtered[method] = existingRules[method];
                            delete existingRules[method];
                        });
                        return filtered;
                }
            }

            var data = $.validator.normalizeRules(
            $.extend(
            {},
            $.validator.metadataRules(element),
            $.validator.classRules(element),
            $.validator.attributeRules(element),
            $.validator.staticRules(element)
            ), element);

            // make sure required is at front
            if (data.required) {
                var param = data.required;
                delete data.required;
                data = $.extend({required: param}, data);
            }

            return data;
        }
    });

    // Custom selectors
    $.extend($.expr[":"], {
        // http://docs.jquery.com/Plugins/Validation/blank
        blank: function(a) {
            return !$.trim(a.value);
        },
        // http://docs.jquery.com/Plugins/Validation/filled
        filled: function(a) {
            return !!$.trim(a.value);
        },
        // http://docs.jquery.com/Plugins/Validation/unchecked
        unchecked: function(a) {
            return !a.checked;
        }
    });

    $.format = function(source, params) {
        if ( arguments.length == 1 )
            return function() {
                var args = $.makeArray(arguments);
                args.unshift(source);
                return $.format.apply( this, args );
            };
        if ( arguments.length > 2 && params.constructor != Array  ) {
            params = $.makeArray(arguments).slice(1);
        }
        if ( params.constructor != Array ) {
            params = [ params ];
        }
        $.each(params, function(i, n) {
            source = source.replace(new RegExp("\\{" + i + "\\}", "g"), n);
        });
        return source;
    };
    // constructor for validator
    $.validator = function( options, form ) {
        this.settings = $.extend( {}, $.validator.defaults, options );
        this.currentForm = form;
        this.init();
    };
    $.extend($.validator, {

        defaults: {
            messages: {},
            groups: {},
            rules: {},
            errorClass: "error",
            errorElement: "label",
            focusInvalid: true,
            errorContainer: $( [] ),
            errorLabelContainer: $( [] ),
            onsubmit: true,
            ignore: [],
            ignoreTitle: false,
            onfocusin: function(element) {
                this.lastActive = element;

                // hide error label and remove error class on focus if enabled
                if ( this.settings.focusCleanup && !this.blockFocusCleanup ) {
                    this.settings.unhighlight && this.settings.unhighlight.call( this, element, this.settings.errorClass );
                    this.errorsFor(element).hide();
                }
            },
            onfocusout: function(element) {
                if ( !this.checkable(element) && (element.name in this.submitted || !this.optional(element)) ) {
                    this.element(element);
                }
            },
            onkeyup: function(element) {
                if ( element.name in this.submitted || element == this.lastElement ) {
                    this.element(element);
                }
            },
            onclick: function(element) {
                if ( element.name in this.submitted )
                    this.element(element);
            },
            highlight: function( element, errorClass ) {
                $( element ).addClass( errorClass );
            },
            unhighlight: function( element, errorClass ) {
                $( element ).removeClass( errorClass );
            }
        },

        // http://docs.jquery.com/Plugins/Validation/Validator/setDefaults
        setDefaults: function(settings) {
            $.extend( $.validator.defaults, settings );
        },
        messages: {
            required: "This field is required.",
            remote: "Please fix this field.",
            email: "Please enter a valid email address.",
            url: "Please enter a valid URL.",
            date: "Please enter a valid date.",
            dateISO: "Please enter a valid date (ISO).",
            dateDE: "Bitte geben Sie ein gültiges Datum ein.",
            number: "Please enter a valid number.",
            numberDE: "Bitte geben Sie eine Nummer ein.",
            digits: "Please enter only digits",
            creditcard: "Please enter a valid credit card number.",
            equalTo: "Please enter the same value again.",
            accept: "Please enter a value with a valid extension.",
            maxlength: $.format("Please enter no more than {0} characters."),
            minlength: $.format("Please enter at least {0} characters."),
            rangelength: $.format("Please enter a value between {0} and {1} characters long."),
            range: $.format("Please enter a value between {0} and {1}."),
            max: $.format("Please enter a value less than or equal to {0}."),
            min: $.format("Please enter a value greater than or equal to {0}.")
        },

        autoCreateRanges: false,

        prototype: {

            init: function() {
                this.labelContainer = $(this.settings.errorLabelContainer);
                this.errorContext = this.labelContainer.length && this.labelContainer || $(this.currentForm);
                this.containers = $(this.settings.errorContainer).add( this.settings.errorLabelContainer );
                this.submitted = {};
                this.valueCache = {};
                this.pendingRequest = 0;
                this.pending = {};
                this.invalid = {};
                this.reset();

                var groups = (this.groups = {});
                $.each(this.settings.groups, function(key, value) {
                    $.each(value.split(/\s/), function(index, name) {
                        groups[name] = key;
                    });
                });
                var rules = this.settings.rules;
                $.each(rules, function(key, value) {
                    rules[key] = $.validator.normalizeRule(value);
                });
                function delegate(event) {
                    var validator = $.data(this[0].form, "validator");
                    validator.settings["on" + event.type] && validator.settings["on" + event.type].call(validator, this[0] );
                }

                $(this.currentForm)
                .delegate("focusin focusout keyup", ":text, :password, :file, select, textarea", delegate)
                .delegate("click", ":radio, :checkbox", delegate);

                if (this.settings.invalidHandler)
                    $(this.currentForm).bind("invalid-form.validate", this.settings.invalidHandler);
            },
            // http://docs.jquery.com/Plugins/Validation/Validator/form
            form: function() {
                this.checkForm();
                $.extend(this.submitted, this.errorMap);
                this.invalid = $.extend({}, this.errorMap);
                if (!this.valid())
                    $(this.currentForm).triggerHandler("invalid-form", [this]);
                this.showErrors();
                return this.valid();
            },
            checkForm: function() {
                this.prepareForm();
                for ( var i = 0, elements = (this.currentElements = this.elements()); elements[i]; i++ ) {
                    this.check( elements[i] );
                }
                return this.valid();
            },
            // http://docs.jquery.com/Plugins/Validation/Validator/element
            element: function( element ) {
                element = this.clean( element );
                this.lastElement = element;
                this.prepareElement( element );
                this.currentElements = $(element);
                var result = this.check( element );
                if ( result ) {
                    delete this.invalid[element.name];
                } else {
                    this.invalid[element.name] = true;
                }
                if ( !this.numberOfInvalids() ) {
                    // Hide error containers on last error
                    this.toHide = this.toHide.add( this.containers );
                }
                this.showErrors();
                return result;
            },
            // http://docs.jquery.com/Plugins/Validation/Validator/showErrors
            showErrors: function(errors) {
                if(errors) {
                    // add items to error list and map
                    $.extend( this.errorMap, errors );
                    this.errorList = [];
                    for ( var name in errors ) {
                        this.errorList.push({
                            message: errors[name],
                            element: this.findByName(name)[0]
                        });
                    }
                    // remove items from success list
                    this.successList = $.grep( this.successList, function(element) {
                        return !(element.name in errors);
                    });
                }
                this.settings.showErrors
                ? this.settings.showErrors.call( this, this.errorMap, this.errorList )
                : this.defaultShowErrors();
            },
            // http://docs.jquery.com/Plugins/Validation/Validator/resetForm
            resetForm: function() {
                if ( $.fn.resetForm )
                    $( this.currentForm ).resetForm();
                this.submitted = {};
                this.prepareForm();
                this.hideErrors();
                this.elements().removeClass( this.settings.errorClass );
            },
            numberOfInvalids: function() {
                return this.objectLength(this.invalid);
            },
            objectLength: function( obj ) {
                var count = 0;
                for ( var i in obj )
                    count++;
                return count;
            },
            hideErrors: function() {
                this.addWrapper( this.toHide ).hide();
            },
            valid: function() {
                return this.size() == 0;
            },
            size: function() {
                return this.errorList.length;
            },
            focusInvalid: function() {
                if( this.settings.focusInvalid ) {
                    try {
                        $(this.findLastActive() || this.errorList.length && this.errorList[0].element || []).filter(":visible").focus();
                    } catch(e) {
                        // ignore IE throwing errors when focusing hidden elements
                    }
                }
            },
            findLastActive: function() {
                var lastActive = this.lastActive;
                return lastActive && $.grep(this.errorList, function(n) {
                    return n.element.name == lastActive.name;
                }).length == 1 && lastActive;
            },
            elements: function() {
                var validator = this,
                rulesCache = {};

                // select all valid inputs inside the form (no submit or reset buttons)
                // workaround $Query([]).add until http://dev.jquery.com/ticket/2114 is solved
                return $([]).add(this.currentForm.elements)
                .filter(":input")
                .not(":submit, :reset, :image, [disabled]")
                .not( this.settings.ignore )
                .filter( function() {
                    !this.name && validator.settings.debug && window.console && console.error( "%o has no name assigned", this);

                    // select only the first element for each name, and only those with rules specified
                    if ( this.name in rulesCache || !validator.objectLength($(this).rules()) )
                        return false;

                    rulesCache[this.name] = true;
                    return true;
                });
            },
            clean: function( selector ) {
                return $( selector )[0];
            },
            errors: function() {
                return $( this.settings.errorElement + "." + this.settings.errorClass, this.errorContext );
            },
            reset: function() {
                this.successList = [];
                this.errorList = [];
                this.errorMap = {};
                this.toShow = $([]);
                this.toHide = $([]);
                this.formSubmitted = false;
                this.currentElements = $([]);
            },
            prepareForm: function() {
                this.reset();
                this.toHide = this.errors().add( this.containers );
            },
            prepareElement: function( element ) {
                this.reset();
                this.toHide = this.errorsFor(element);
            },
            check: function( element ) {
                element = this.clean( element );

                // if radio/checkbox, validate first element in group instead
                if (this.checkable(element)) {
                    element = this.findByName( element.name )[0];
                }

                var rules = $(element).rules();
                var dependencyMismatch = false;
                for( method in rules ) {
                    var rule = { method: method, parameters: rules[method] };
                    try {
                        var result = $.validator.methods[method].call( this, element.value.replace(/\r/g, ""), element, rule.parameters );

                        // if a method indicates that the field is optional and therefore valid,
                        // don't mark it as valid when there are no other rules
                        if ( result == "dependency-mismatch" ) {
                            dependencyMismatch = true;
                            continue;
                        }
                        dependencyMismatch = false;

                        if ( result == "pending" ) {
                            this.toHide = this.toHide.not( this.errorsFor(element) );
                            return;
                        }

                        if( !result ) {
                            this.formatAndAdd( element, rule );
                            return false;
                        }
                    } catch(e) {
                        this.settings.debug && window.console && console.log("exception occured when checking element " + element.id
                        + ", check the '" + rule.method + "' method");
                        throw e;
                    }
                }
                if (dependencyMismatch)
                    return;
                if ( this.objectLength(rules) )
                    this.successList.push(element);
                return true;
            },
            // return the custom message for the given element and validation method
            // specified in the element's "messages" metadata
            customMetaMessage: function(element, method) {
                if (!$.metadata)
                    return;

                var meta = this.settings.meta
                ? $(element).metadata()[this.settings.meta]
                : $(element).metadata();

                return meta && meta.messages && meta.messages[method];
            },
            // return the custom message for the given element name and validation method
            customMessage: function( name, method ) {
                var m = this.settings.messages[name];
                return m && (m.constructor == String
                    ? m
                    : m[method]);
            },
            // return the first defined argument, allowing empty strings
            findDefined: function() {
                for(var i = 0; i < arguments.length; i++) {
                    if (arguments[i] !== undefined)
                        return arguments[i];
                }
                return undefined;
            },
            defaultMessage: function( element, method) {
                return this.findDefined(
                this.customMessage( element.name, method ),
                this.customMetaMessage( element, method ),
                // title is never undefined, so handle empty string as undefined
                !this.settings.ignoreTitle && element.title || undefined,
                $.validator.messages[method],
                "<strong>Warning: No message defined for " + element.name + "</strong>"
                );
            },
            formatAndAdd: function( element, rule ) {
                var message = this.defaultMessage( element, rule.method );
                if ( typeof message == "function" )
                    message = message.call(this, rule.parameters, element);
                this.errorList.push({
                    message: message,
                    element: element
                });
                this.errorMap[element.name] = message;
                this.submitted[element.name] = message;
            },
            addWrapper: function(toToggle) {
                if ( this.settings.wrapper )
                    toToggle = toToggle.add( toToggle.parents( this.settings.wrapper ) );
                return toToggle;
            },
            defaultShowErrors: function() {
                for ( var i = 0; this.errorList[i]; i++ ) {
                    var error = this.errorList[i];
                    this.settings.highlight && this.settings.highlight.call( this, error.element, this.settings.errorClass );
                    this.showLabel( error.element, error.message );
                }
                if( this.errorList.length ) {
                    this.toShow = this.toShow.add( this.containers );
                }
                if (this.settings.success) {
                    for ( var i = 0; this.successList[i]; i++ ) {
                        this.showLabel( this.successList[i] );
                    }
                }
                if (this.settings.unhighlight) {
                    for ( var i = 0, elements = this.validElements(); elements[i]; i++ ) {
                        this.settings.unhighlight.call( this, elements[i], this.settings.errorClass );
                    }
                }
                this.toHide = this.toHide.not( this.toShow );
                this.hideErrors();
                this.addWrapper( this.toShow ).show();
            },
            validElements: function() {
                return this.currentElements.not(this.invalidElements());
            },
            invalidElements: function() {
                return $(this.errorList).map( function() {
                    return this.element;
                });
            },
            showLabel: function(element, message) {
                var label = this.errorsFor( element );
                if ( label.length ) {
                    // refresh error/success class
                    label.removeClass().addClass( this.settings.errorClass );

                    // check if we have a generated label, replace the message then
                    label.attr("generated") && label.html(message);
                } else {
                    // create label
                    label = $("<" + this.settings.errorElement + "/>")
                    .attr({"for":  this.idOrName(element), generated: true})
                    .addClass(this.settings.errorClass)
                    .html(message || "");
                    if ( this.settings.wrapper ) {
                        // make sure the element is visible, even in IE
                        // actually showing the wrapped element is handled elsewhere
                        label = label.hide().show().wrap("<" + this.settings.wrapper + "/>").parent();
                    }
                    if ( !this.labelContainer.append(label).length )
                        this.settings.errorPlacement
                        ? this.settings.errorPlacement(label, $(element) )
                        : label.insertAfter(element);
                }
                if ( !message && this.settings.success ) {
                    label.text("");
                    typeof this.settings.success == "string"
                    ? label.addClass( this.settings.success )
                    : this.settings.success( label );
                }
                this.toShow = this.toShow.add(label);
            },
            errorsFor: function(element) {
                return this.errors().filter("[for='" + this.idOrName(element) + "']");
            },
            idOrName: function(element) {
                return this.groups[element.name] || (this.checkable(element) ? element.name : element.id || element.name);
            },
            checkable: function( element ) {
                return /radio|checkbox/i.test(element.type);
            },
            findByName: function( name ) {
                // select by name and filter by form for performance over form.find("[name=...]")
                var form = this.currentForm;
                return $(document.getElementsByName(name)).map( function(index, element) {
                    return element.form == form && element.name == name && element  || null;
                });
            },
            getLength: function(value, element) {
                switch( element.nodeName.toLowerCase() ) {
                    case 'select':
                        return $("option:selected", element).length;
                    case 'input':
                        if( this.checkable( element) )
                            return this.findByName(element.name).filter(':checked').length;
                }
                return value.length;
            },
            depend: function(param, element) {
                return this.dependTypes[typeof param]
                ? this.dependTypes[typeof param](param, element)
                : true;
            },
            dependTypes: {
                "boolean": function(param, element) {
                    return param;
                },
                "string": function(param, element) {
                    return !!$(param, element.form).length;
                },
                "function": function(param, element) {
                    return param(element);
                }
            },

            optional: function(element) {
                return !$.validator.methods.required.call(this, $.trim(element.value), element) && "dependency-mismatch";
            },
            startRequest: function(element) {
                if (!this.pending[element.name]) {
                    this.pendingRequest++;
                    this.pending[element.name] = true;
                }
            },
            stopRequest: function(element, valid) {
                this.pendingRequest--;
                // sometimes synchronization fails, make sure pendingRequest is never < 0
                if (this.pendingRequest < 0)
                    this.pendingRequest = 0;
                delete this.pending[element.name];
                if ( valid && this.pendingRequest == 0 && this.formSubmitted && this.form() ) {
                    $(this.currentForm).submit();
                } else if (!valid && this.pendingRequest == 0 && this.formSubmitted) {
                    $(this.currentForm).triggerHandler("invalid-form", [this]);
                }
            },
            previousValue: function(element) {
                return $.data(element, "previousValue") || $.data(element, "previousValue", previous = {
                    old: null,
                    valid: true,
                    message: this.defaultMessage( element, "remote" )
                });
            }
        },

        classRuleSettings: {
            required: {required: true},
            email: {email: true},
            url: {url: true},
            date: {date: true},
            dateISO: {dateISO: true},
            dateDE: {dateDE: true},
            number: {number: true},
            numberDE: {numberDE: true},
            digits: {digits: true},
            creditcard: {creditcard: true}
        },

        addClassRules: function(className, rules) {
            className.constructor == String ?
            this.classRuleSettings[className] = rules :
            $.extend(this.classRuleSettings, className);
        },
        classRules: function(element) {
            var rules = {};
            var classes = $(element).attr('class');
            classes && $.each(classes.split(' '), function() {
                if (this in $.validator.classRuleSettings) {
                    $.extend(rules, $.validator.classRuleSettings[this]);
                }
            });
            return rules;
        },
        attributeRules: function(element) {
            var rules = {};
            var $element = $(element);

            for (method in $.validator.methods) {
                var value = $element.attr(method);
                if (value) {
                    rules[method] = value;
                }
            }

            // maxlength may be returned as -1, 2147483647 (IE) and 524288 (safari) for text inputs
            if (rules.maxlength && /-1|2147483647|524288/.test(rules.maxlength)) {
                delete rules.maxlength;
            }

            return rules;
        },
        metadataRules: function(element) {
            if (!$.metadata)
                return {};

            var meta = $.data(element.form, 'validator').settings.meta;
            return meta ?
            $(element).metadata()[meta] :
            $(element).metadata();
        },
        staticRules: function(element) {
            var rules = {};
            var validator = $.data(element.form, 'validator');
            if (validator.settings.rules) {
                rules = $.validator.normalizeRule(validator.settings.rules[element.name]) || {};
            }
            return rules;
        },
        normalizeRules: function(rules, element) {
            // handle dependency check
            $.each(rules, function(prop, val) {
                // ignore rule when param is explicitly false, eg. required:false
                if (val === false) {
                    delete rules[prop];
                    return;
                }
                if (val.param || val.depends) {
                    var keepRule = true;
                    switch (typeof val.depends) {
                        case "string":
                            keepRule = !!$(val.depends, element.form).length;
                            break;
                        case "function":
                            keepRule = val.depends.call(element, element);
                            break;
                    }
                    if (keepRule) {
                        rules[prop] = val.param !== undefined ? val.param : true;
                    } else {
                        delete rules[prop];
                    }
                }
            });
            // evaluate parameters
            $.each(rules, function(rule, parameter) {
                rules[rule] = $.isFunction(parameter) ? parameter(element) : parameter;
            });
            // clean number parameters
            $.each(['minlength', 'maxlength', 'min', 'max'], function() {
                if (rules[this]) {
                    rules[this] = Number(rules[this]);
                }
            });
            $.each(['rangelength', 'range'], function() {
                if (rules[this]) {
                    rules[this] = [Number(rules[this][0]), Number(rules[this][1])];
                }
            });
            if ($.validator.autoCreateRanges) {
                // auto-create ranges
                if (rules.min && rules.max) {
                    rules.range = [rules.min, rules.max];
                    delete rules.min;
                    delete rules.max;
                }
                if (rules.minlength && rules.maxlength) {
                    rules.rangelength = [rules.minlength, rules.maxlength];
                    delete rules.minlength;
                    delete rules.maxlength;
                }
            }

            // To support custom messages in metadata ignore rule methods titled "messages"
            if (rules.messages) {
                delete rules.messages
            }

            return rules;
        },
        // Converts a simple string to a {string: true} rule, e.g., "required" to {required:true}
        normalizeRule: function(data) {
            if( typeof data == "string" ) {
                var transformed = {};
                $.each(data.split(/\s/), function() {
                    transformed[this] = true;
                });
                data = transformed;
            }
            return data;
        },
        // http://docs.jquery.com/Plugins/Validation/Validator/addMethod
        addMethod: function(name, method, message) {
            $.validator.methods[name] = method;
            $.validator.messages[name] = message;
            if (method.length < 3) {
                $.validator.addClassRules(name, $.validator.normalizeRule(name));
            }
        },
        methods: {

            // http://docs.jquery.com/Plugins/Validation/Methods/required
            required: function(value, element, param) {
                // check if dependency is met
                if ( !this.depend(param, element) )
                    return "dependency-mismatch";
                switch( element.nodeName.toLowerCase() ) {
                    case 'select':
                        var options = $("option:selected", element);
                        return options.length > 0 && ( element.type == "select-multiple" || ($.browser.msie && !(options[0].attributes['value'].specified) ? options[0].text : options[0].value).length > 0);
                    case 'input':
                        if ( this.checkable(element) )
                            return this.getLength(value, element) > 0;
                    default:
                        return $.trim(value).length > 0;
                }
            },
            // http://docs.jquery.com/Plugins/Validation/Methods/remote
            remote: function(value, element, param) {
                if ( this.optional(element) )
                    return "dependency-mismatch";

                var previous = this.previousValue(element);

                if (!this.settings.messages[element.name] )
                    this.settings.messages[element.name] = {};
                this.settings.messages[element.name].remote = typeof previous.message == "function" ? previous.message(value) : previous.message;

                param = typeof param == "string" && {url:param} || param;

                if ( previous.old !== value ) {
                    previous.old = value;
                    var validator = this;
                    this.startRequest(element);
                    var data = {};
                    data[element.name] = value;
                    $.ajax($.extend(true, {
                        url: param,
                        mode: "abort",
                        port: "validate" + element.name,
                        dataType: "json",
                        data: data,
                        success: function(response) {
                            if ( response ) {
                                var submitted = validator.formSubmitted;
                                validator.prepareElement(element);
                                validator.formSubmitted = submitted;
                                validator.successList.push(element);
                                validator.showErrors();
                            } else {
                                var errors = {};
                                errors[element.name] =  response || validator.defaultMessage( element, "remote" );
                                validator.showErrors(errors);
                            }
                            previous.valid = response;
                            validator.stopRequest(element, response);
                        }
                    }, param));
                    return "pending";
                } else if( this.pending[element.name] ) {
                    return "pending";
                }
                return previous.valid;
            },
            // http://docs.jquery.com/Plugins/Validation/Methods/minlength
            minlength: function(value, element, param) {
                return this.optional(element) || this.getLength($.trim(value), element) >= param;
            },
            // http://docs.jquery.com/Plugins/Validation/Methods/maxlength
            maxlength: function(value, element, param) {
                return this.optional(element) || this.getLength($.trim(value), element) <= param;
            },
            // http://docs.jquery.com/Plugins/Validation/Methods/rangelength
            rangelength: function(value, element, param) {
                var length = this.getLength($.trim(value), element);
                return this.optional(element) || ( length >= param[0] && length <= param[1] );
            },
            // http://docs.jquery.com/Plugins/Validation/Methods/min
            min: function( value, element, param ) {
                return this.optional(element) || value >= param;
            },
            // http://docs.jquery.com/Plugins/Validation/Methods/max
            max: function( value, element, param ) {
                return this.optional(element) || value <= param;
            },
            // http://docs.jquery.com/Plugins/Validation/Methods/range
            range: function( value, element, param ) {
                return this.optional(element) || ( value >= param[0] && value <= param[1] );
            },
            // http://docs.jquery.com/Plugins/Validation/Methods/email
            email: function(value, element) {
                // contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
                return this.optional(element) || /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(value);
            },
            // http://docs.jquery.com/Plugins/Validation/Methods/url
            url: function(value, element) {
                // contributed by Scott Gonzalez: http://projects.scottsplayground.com/iri/
                return this.optional(element) || /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
            },
            // http://docs.jquery.com/Plugins/Validation/Methods/date
            date: function(value, element) {
                return this.optional(element) || !/Invalid|NaN/.test(new Date(value));
            },
            // http://docs.jquery.com/Plugins/Validation/Methods/dateISO
            dateISO: function(value, element) {
                return this.optional(element) || /^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(value);
            },
            // http://docs.jquery.com/Plugins/Validation/Methods/dateDE
            dateDE: function(value, element) {
                return this.optional(element) || /^\d\d?\.\d\d?\.\d\d\d?\d?$/.test(value);
            },
            // http://docs.jquery.com/Plugins/Validation/Methods/number
            number: function(value, element) {
                return this.optional(element) || /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value);
            },
            // http://docs.jquery.com/Plugins/Validation/Methods/numberDE
            numberDE: function(value, element) {
                return this.optional(element) || /^-?(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d+)?$/.test(value);
            },
            // http://docs.jquery.com/Plugins/Validation/Methods/digits
            digits: function(value, element) {
                return this.optional(element) || /^\d+$/.test(value);
            },
            // http://docs.jquery.com/Plugins/Validation/Methods/creditcard
            // based on http://en.wikipedia.org/wiki/Luhn
            creditcard: function(value, element) {
                if ( this.optional(element) )
                    return "dependency-mismatch";
                // accept only digits and dashes
                if (/[^0-9-]+/.test(value))
                    return false;
                var nCheck = 0,
                nDigit = 0,
                bEven = false;

                value = value.replace(/\D/g, "");

                for (n = value.length - 1; n >= 0; n--) {
                    var cDigit = value.charAt(n);
                    var nDigit = parseInt(cDigit, 10);
                    if (bEven) {
                        if ((nDigit *= 2) > 9)
                            nDigit -= 9;
                    }
                    nCheck += nDigit;
                    bEven = !bEven;
                }

                return (nCheck % 10) == 0;
            },
            // http://docs.jquery.com/Plugins/Validation/Methods/accept
            accept: function(value, element, param) {
                param = typeof param == "string" ? param : "png|jpe?g|gif";
                return this.optional(element) || value.match(new RegExp(".(" + param + ")$", "i"));
            },
            // http://docs.jquery.com/Plugins/Validation/Methods/equalTo
            equalTo: function(value, element, param) {
                return value == $(param).val();
            }
        }

    });

})(jQuery);
// ajax mode: abort
// usage: $.ajax({ mode: "abort"[, port: "uniqueport"]});
// if mode:"abort" is used, the previous request on that port (port can be undefined) is aborted via XMLHttpRequest.abort()
;
(function($) {
    var ajax = $.ajax;
    var pendingRequests = {};
    $.ajax = function(settings) {
        // create settings for compatibility with ajaxSetup
        settings = $.extend(settings, $.extend({}, $.ajaxSettings, settings));
        var port = settings.port;
        if (settings.mode == "abort") {
            if ( pendingRequests[port] ) {
                pendingRequests[port].abort();
            }
            return (pendingRequests[port] = ajax.apply(this, arguments));
        }
        return ajax.apply(this, arguments);
    };
})(jQuery);
// provides cross-browser focusin and focusout events
// IE has native support, in other browsers, use event caputuring (neither bubbles)

// provides delegate(type: String, delegate: Selector, handler: Callback) plugin for easier event delegation
// handler is only called when $(event.target).is(delegate), in the scope of the jquery-object for event.target

// provides triggerEvent(type: String, target: Element) to trigger delegated events
;
(function($) {
    $.each({
        focus: 'focusin',
        blur: 'focusout'
    }, function( original, fix ) {
        $.event.special[fix] = {
            setup: function() {
                if ( $.browser.msie )
                    return false;
                this.addEventListener( original, $.event.special[fix].handler, true );
            },
            teardown: function() {
                if ( $.browser.msie )
                    return false;
                this.removeEventListener( original,
                $.event.special[fix].handler, true );
            },
            handler: function(e) {
                arguments[0] = $.event.fix(e);
                arguments[0].type = fix;
                return $.event.handle.apply(this, arguments);
            }
        };
    });
    $.extend($.fn, {
        delegate: function(type, delegate, handler) {
            return this.bind(type, function(event) {
                var target = $(event.target);
                if (target.is(delegate)) {
                    return handler.apply(target, arguments);
                }
            });
        },
        triggerEvent: function(type, target) {
            return this.triggerHandler(type, [$.event.fix({ type: type, target: target })]);
        }
    })
})(jQuery);
/*
 * jQuery doTimeout: Like setTimeout, but better! - v1.0 - 3/3/2010
 * http://benalman.com/projects/jquery-dotimeout-plugin/
 *
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function($) {
    var a={},c="doTimeout",d=Array.prototype.slice;
    $[c]= function() {
        return b.apply(window,[0].concat(d.call(arguments)))
    };
    $.fn[c]= function() {
        var f=d.call(arguments),e=b.apply(this,[c+f[0]].concat(f));
        return typeof f[0]==="number"||typeof f[1]==="number"?this:e
    };
    function b(l) {
        var m=this,h,k={},g=l?$.fn:$,n=arguments,i=4,f=n[1],j=n[2],p=n[3];
        if(typeof f!=="string") {
            i--;
            f=l=0;
            j=n[1];
            p=n[2]
        }
        if(l) {
            h=m.eq(0);
            h.data(l,k=h.data(l)||{})
        } else {
            if(f) {
                k=a[f]||(a[f]={})
            }
        }
        k.id&&clearTimeout(k.id);
        delete k.id;
        function e() {
            if(l) {
                h.removeData(l)
            } else {
                if(f) {
                    delete a[f]
                }
            }
        }

        function o() {
            k.id=setTimeout( function() {
                k.fn()
            },j)
        }

        if(p) {
            k.fn= function(q) {
                if(typeof p==="string") {
                    p=g[p]
                }p.apply(m,d.call(n,i))===true&&!q?o():e()
            };
            o()
        } else {
            if(k.fn) {j===undefined?e():k.fn(j===false);
                return true
            } else {
                e()
            }
        }
    }

})(jQuery);
// MSDropDown - jquery.dd.js
// author: Marghoob Suleman - Search me on google
// Date: 12th Aug, 2009
// Version: 2.3 {date: 18 June 2010}
// Revision: 27
// web: www.giftlelo.com | www.marghoobsuleman.com
/*
 // msDropDown is free jQuery Plugin: you can redistribute it and/or modify
 // it under the terms of the either the MIT License or the Gnu General Public License (GPL) Version 2
 */
eval( function(p,a,c,k,e,r) {
    e= function(c) {
        return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))
    };
    if(!''.replace(/^/,String)) {
        while(c--)
            r[e(c)]=k[c]||e(c);
        k=[
        function(e) {
            return r[e]
        }];

        e= function() {
            return'\\w+'
        };
        c=1
    };
    while(c--)
        if(k[c])
            p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);
    return p
}(';(6($){4 1E="";4 2T=6(p,q){4 r=p;4 s=1b;4 q=$.2U({1j:3F,2a:7,2V:23,1F:11,1V:3G,2W:\'1W\',1G:14,2t:\'\',1k:\'\'},q);1b.1N=2b 2X();4 t="";4 u={};u.2u=11;u.2c=14;u.2d=1n;4 v=14;4 w={2v:\'3H\',1O:\'3I\',1H:\'3J\',1I:\'3K\',1f:\'3L\',2w:\'3M\',2x:\'3N\',3O:\'3P\',2e:\'3Q\',2Y:\'3R\'};4 x={1W:q.2W,2y:\'2y\',2z:\'2z\',2A:\'2A\',1p:\'1p\',1i:.30,2B:\'2B\'};4 y={2Z:"2f,2C,2D,1P,2g,2h,1q,1w,2i,1J,3S,1X,2E",3T:"1x,1r,1i,3U"};1b.1K=2b 2X();4 z=$(r).12("1a");4 A=$(r).12("1k");q.1k+=(A==18)?"":A;4 B=$(r).31();v=($(r).12("1x")>0||$(r).12("1r")==11)?11:14;5(v){q.2a=$(r).12("1x")};4 C={};4 D=6(a){15 z+w[a]};4 E=6(a){4 b=a;4 c=$(b).12("1k");15 c};4 F=6(a){4 b=$("#"+z+" 2j:9");5(b.1c>1){1s(4 i=0;i<b.1c;i++){5(a==b[i].1g){15 11}}}1d 5(b.1c==1){5(b[0].1g==a){15 11}};15 14};4 G=6(a,b,c,d){4 e="";4 f=(d=="2F")?D("2x"):D("2w");4 g=(d=="2F")?f+"2G"+(b)+"2G"+(c):f+"2G"+(b);4 h="";4 i="";5(q.1G!=14){i=\' \'+q.1G+\' \'+a.32}1d{h=$(a).12("1Q");h=(h.1c==0)?"":\'<33 34="\'+h+\'" 35="36" /> \'};4 j=$(a).1y();4 k=$(a).3V();4 l=($(a).12("1i")==11)?"1i":"2k";C[g]={1z:h+j,1Y:k,1y:j,1g:a.1g,1a:g};4 m=E(a);5(F(a.1g)==11){e+=\'<a 3a="3b:3c(0);" 1o="9 \'+l+i+\'"\'}1d{e+=\'<a  3a="3b:3c(0);" 1o="\'+l+i+\'"\'};5(m!==14&&m!==18){e+=" 1k=\'"+m+"\'"};e+=\' 1a="\'+g+\'">\';e+=h+\'<1t 1o="\'+x.1p+\'">\'+j+\'</1t></a>\';15 e};4 H=6(){4 f=B;5(f.1c==0)15"";4 g="";4 h=D("2w");4 i=D("2x");f.2H(6(c){4 d=f[c];5(d.3W=="3X"){g+="<1u 1o=\'3Y\'>";g+="<1t 1k=\'3d-3Z:41;3d-1k:42; 43:44;\'>"+$(d).12("45")+"</1t>";4 e=$(d).31();e.2H(6(a){4 b=e[a];g+=G(b,c,a,"2F")});g+="</1u>"}1d{g+=G(d,c,"","")}});15 g};4 I=6(){4 a=D("1O");4 b=D("1f");4 c=q.1k;1R="";1R+=\'<1u 1a="\'+b+\'" 1o="\'+x.2A+\'"\';5(!v){1R+=(c!="")?\' 1k="\'+c+\'"\':\'\'}1d{1R+=(c!="")?\' 1k="46-2l:47 48 #49;1S:2I;1A:2J;\'+c+\'"\':\'\'}1R+=\'>\';15 1R};4 J=6(){4 a=D("1H");4 b=D("2e");4 c=D("1I");4 d=D("2Y");4 e="";4 f="";5(8.10(z).1B.1c>0){e=$("#"+z+" 2j:9").1y();f=$("#"+z+" 2j:9").12("1Q")};f=(f.1c==0||f==18||q.1F==14||q.1G!=14)?"":\'<33 34="\'+f+\'" 35="36" /> \';4 g=\'<1u 1a="\'+a+\'" 1o="\'+x.2y+\'"\';g+=\'>\';g+=\'<1t 1a="\'+b+\'" 1o="\'+x.2z+\'"></1t><1t 1o="\'+x.1p+\'" 1a="\'+c+\'">\'+f+\'<1t 1o="\'+x.1p+\'">\'+e+\'</1t></1t></1u>\';15 g};4 K=6(){4 c=D("1f");$("#"+c+" a.2k").1e("1P",6(a){a.1Z();N(1b);5(!v){$("#"+c).1L("1w");P(14);4 b=(q.1F==14)?$(1b).1y():$(1b).1z();T(b);s.20()};X()})};4 L=6(){4 d=14;4 e=D("1O");4 f=D("1H");4 g=D("1I");4 h=D("1f");4 i=D("2e");4 j=$("#"+z).2K();j=j+2;4 k=q.1k;5($("#"+e).1c>0){$("#"+e).2m();d=11};4 l=\'<1u 1a="\'+e+\'" 1o="\'+x.1W+\'"\';l+=(k!="")?\' 1k="\'+k+\'"\':\'\';l+=\'>\';l+=J();l+=I();l+=H();l+="</1u>";l+="</1u>";5(d==11){4 m=D("2v");$("#"+m).2L(l)}1d{$("#"+z).2L(l)};5(v){4 f=D("1H");$("#"+f).2n()};$("#"+e).19("2K",j+"21");$("#"+h).19("2K",(j-2)+"21");5(B.1c>q.2a){4 n=22($("#"+h+" a:3e").19("24-3f"))+22($("#"+h+" a:3e").19("24-2l"));4 o=((q.2V)*q.2a)-n;$("#"+h).19("1j",o+"21")}1d 5(v){4 o=$("#"+z).1j();$("#"+h).19("1j",o+"21")};5(d==14){S();O(z)};5($("#"+z).12("1i")==11){$("#"+e).19("2o",x.1i)};R();$("#"+f).1e("1w",6(a){2M(1)});$("#"+f).1e("1J",6(a){2M(0)});K();$("#"+h+" a.1i").19("2o",x.1i);5(v){$("#"+h).1e("1w",6(c){5(!u.2c){u.2c=11;$(8).1e("1X",6(a){4 b=a.3g;u.2d=b;5(b==39||b==40){a.1Z();a.2p();U();X()};5(b==37||b==38){a.1Z();a.2p();V();X()}})}})};$("#"+h).1e("1J",6(a){P(14);$(8).1L("1X");u.2c=14;u.2d=1n});$("#"+f).1e("1P",6(b){P(14);5($("#"+h+":3h").1c==1){$("#"+h).1L("1w")}1d{$("#"+h).1e("1w",6(a){P(11)});s.3i()}});$("#"+f).1e("1J",6(a){P(14)});5(q.1F&&q.1G!=14){W()}};4 M=6(a){1s(4 i 2q C){5(C[i].1g==a){15 C[i]}};15-1};4 N=6(a){4 b=D("1f");5(!v){$("#"+b+" a.9").1M("9")};4 c=$("#"+b+" a.9").12("1a");5(c!=18){4 d=(u.1T==18||u.1T==1n)?C[c].1g:u.1T};5(a&&!v){$(a).1D("9")};5(v){4 e=u.2d;5($("#"+z).12("1r")==11){5(e==17){u.1T=C[$(a).12("1a")].1g;$(a).4a("9")}1d 5(e==16){$("#"+b+" a.9").1M("9");$(a).1D("9");4 f=$(a).12("1a");4 g=C[f].1g;1s(4 i=3j.4b(d,g);i<=3j.4c(d,g);i++){$("#"+M(i).1a).1D("9")}}1d{$("#"+b+" a.9").1M("9");$(a).1D("9");u.1T=C[$(a).12("1a")].1g}}1d{$("#"+b+" a.9").1M("9");$(a).1D("9");u.1T=C[$(a).12("1a")].1g}}};4 O=6(a){4 b=a;8.10(b).4d=6(e){$("#"+b).1U(q)}};4 P=6(a){u.2u=a};4 Q=6(){15 u.2u};4 R=6(){4 b=D("1O");4 c=y.2Z.4e(",");1s(4 d=0;d<c.1c;d++){4 e=c[d];4 f=Y(e);5(f==11){3k(e){1m"2f":$("#"+b).1e("4f",6(a){8.10(z).2f()});1h;1m"1P":$("#"+b).1e("1P",6(a){$("#"+z).1C("1P")});1h;1m"2g":$("#"+b).1e("2g",6(a){$("#"+z).1C("2g")});1h;1m"2h":$("#"+b).1e("2h",6(a){$("#"+z).1C("2h")});1h;1m"1q":$("#"+b).1e("1q",6(a){$("#"+z).1C("1q")});1h;1m"1w":$("#"+b).1e("1w",6(a){$("#"+z).1C("1w")});1h;1m"2i":$("#"+b).1e("2i",6(a){$("#"+z).1C("2i")});1h;1m"1J":$("#"+b).1e("1J",6(a){$("#"+z).1C("1J")});1h}}}};4 S=6(){4 a=D("2v");$("#"+z).2L("<1u 1o=\'"+x.2B+"\' 1k=\'1j:4g;4h:4i;1A:3l;\' 1a=\'"+a+"\'></1u>");$("#"+z).4j($("#"+a))};4 T=6(a){4 b=D("1I");$("#"+b).1z(a)};4 U=6(){4 a=D("1I");4 b=D("1f");4 c=$("#"+b+" a.2k");1s(4 d=0;d<c.1c;d++){4 e=c[d];4 f=$(e).12("1a");5($(e).3m("9")&&d<c.1c-1){$("#"+b+" a.9").1M("9");$(c[d+1]).1D("9");4 g=$("#"+b+" a.9").12("1a");5(!v){4 h=(q.1F==14)?C[g].1y:C[g].1z;T(h)};5(22(($("#"+g).1A().2l+$("#"+g).1j()))>=22($("#"+b).1j())){$("#"+b).2r(($("#"+b).2r())+$("#"+g).1j()+$("#"+g).1j())};1h}}};4 V=6(){4 a=D("1I");4 b=D("1f");4 c=$("#"+b+" a.2k");1s(4 d=0;d<c.1c;d++){4 e=c[d];4 f=$(e).12("1a");5($(e).3m("9")&&d!=0){$("#"+b+" a.9").1M("9");$(c[d-1]).1D("9");4 g=$("#"+b+" a.9").12("1a");5(!v){4 h=(q.1F==14)?C[g].1y:C[g].1z;T(h)};5(22(($("#"+g).1A().2l+$("#"+g).1j()))<=0){$("#"+b).2r(($("#"+b).2r()-$("#"+b).1j())-$("#"+g).1j())};1h}}};4 W=6(){5(q.1G!=14){4 a=D("1I");4 b=8.10(z).1B[8.10(z).1l].32;5(b.1c>0){4 c=D("1f");4 d=$("#"+c+" a."+b).12("1a");4 e=$("#"+d).19("25-4k");4 f=$("#"+d).19("25-1A");4 g=$("#"+d).19("24-3n");5(e!=18){$("#"+a).26("."+x.1p).12(\'1k\',"25:"+e)};5(f!=18){$("#"+a).26("."+x.1p).19(\'25-1A\',f)};5(g!=18){$("#"+a).26("."+x.1p).19(\'24-3n\',g)};$("#"+a).26("."+x.1p).19(\'25-3o\',\'4l-3o\');$("#"+a).26("."+x.1p).19(\'24-3f\',\'4m\')}}};4 X=6(){4 a=D("1f");4 b=$("#"+a+" a.9");5(b.1c==1){4 c=$("#"+a+" a.9").1y();4 d=$("#"+a+" a.9").12("1a");5(d!=18){4 e=C[d].1Y;8.10(z).1l=C[d].1g};5(q.1F&&q.1G!=14)W()}1d 5(b.1c>1){4 f=$("#"+z+" > 2j:9").4n("9");1s(4 i=0;i<b.1c;i++){4 d=$(b[i]).12("1a");4 g=C[d].1g;8.10(z).1B[g].9="9"}};4 h=8.10(z).1l;s.1N["1l"]=h};4 Y=6(a){5($("#"+z).12("4o"+a)!=18){15 11};4 b=$("#"+z).2N("4p");5(b&&b[a]){15 11};15 14};4 Z=6(){4 b=D("1f");5(Y(\'2D\')==11){4 c=C[$("#"+b+" a.9").12("1a")].1y;5(t!=c){$("#"+z).1C("2D")}};5(Y(\'1q\')==11){$("#"+z).1C("1q")};5(Y(\'2C\')==11){$(8).1e("1q",6(a){$("#"+z).2f();$("#"+z)[0].2C();X();$(8).1L("1q")})}};4 2M=6(a){4 b=D("2e");5(a==1)$("#"+b).19({3p:\'0 4q%\'});1d $("#"+b).19({3p:\'0 0\'})};4 3q=6(){1s(4 i 2q 8.10(z)){5(4r(8.10(z)[i])!=\'6\'&&8.10(z)[i]!==18&&8.10(z)[i]!==1n){s.1v(i,8.10(z)[i],11)}}};4 3r=6(a,b){5(M(b)!=-1){8.10(z)[a]=b;4 c=D("1f");$("#"+c+" a.9").1M("9");$("#"+M(b).1a).1D("9");4 d=M(8.10(z).1l).1z;T(d)}};4 3s=6(i,a){5(a==\'d\'){1s(4 b 2q C){5(C[b].1g==i){4s C[b];1h}}};4 c=0;1s(4 b 2q C){C[b].1g=c;c++}};1b.3i=6(){5((s.28("1i",11)==11)||(s.28("1B",11).1c==0))15;4 c=D("1f");5(1E!=""&&c!=1E){$("#"+1E).3t("2O");$("#"+1E).19({1V:\'0\'})};5($("#"+c).19("1S")=="3u"){$(8).1e("1X",6(a){4 b=a.3g;5(b==39||b==40){a.1Z();a.2p();U()};5(b==37||b==38){a.1Z();a.2p();V()};5(b==27||b==13){s.20();X()};5($("#"+z).12("3v")!=18){8.10(z).3v()}});$(8).1e("2E",6(a){5($("#"+z).12("3w")!=18){8.10(z).3w()}});$(8).1e("1q",6(a){5(Q()==14){s.20()}});$("#"+c).19({1V:q.1V});$("#"+c).4t("2O",6(){5(s.1K["3x"]!=1n){2s(s.1K["3x"])(s)}});5(c!=1E){1E=c}}};1b.20=6(){4 b=D("1f");$(8).1L("1X");$(8).1L("2E");$(8).1L("1q");$("#"+b).3t("2O",6(a){Z();$("#"+b).19({1V:\'0\'});5(s.1K["3y"]!=1n){2s(s.1K["3y"])(s)}})};1b.1l=6(i){s.1v("1l",i)};1b.1v=6(a,b,c){5(a==18||b==18)3z{3A:"1v 4u 4v?"};s.1N[a]=b;5(c!=11){3k(a){1m"1l":3r(a,b);1h;1m"1i":s.1i(b,11);1h;1m"1r":8.10(z)[a]=b;v=($(r).12("1x")>0||$(r).12("1r")==11)?11:14;5(v){4 d=$("#"+z).1j();4 f=D("1f");$("#"+f).19("1j",d+"21");4 g=D("1H");$("#"+g).2n();4 f=D("1f");$("#"+f).19({1S:\'2I\',1A:\'2J\'});K()}1h;1m"1x":8.10(z)[a]=b;5(b==0){8.10(z).1r=14};v=($(r).12("1x")>0||$(r).12("1r")==11)?11:14;5(b==0){4 g=D("1H");$("#"+g).3B();4 f=D("1f");$("#"+f).19({1S:\'3u\',1A:\'3l\'});4 h="";5(8.10(z).1l>=0){4 i=M(8.10(z).1l);h=i.1z;N($("#"+i.1a))};T(h)}1d{4 g=D("1H");$("#"+g).2n();4 f=D("1f");$("#"+f).19({1S:\'2I\',1A:\'2J\'})};1h;4w:4x{8.10(z)[a]=b}4y(e){};1h}}};1b.28=6(a,b){5(a==18&&b==18){15 s.1N};5(a!=18&&b==18){15(s.1N[a]!=18)?s.1N[a]:1n};5(a!=18&&b!=18){15 8.10(z)[a]}};1b.3h=6(a){4 b=D("1O");5(a==11){$("#"+b).3B()}1d 5(a==14){$("#"+b).2n()}1d{15 $("#"+b).19("1S")}};1b.4z=6(a,b){4 c=a;4 d=c.1y;4 e=(c.1Y==18||c.1Y==1n)?d:c.1Y;4 f=(c.1Q==18||c.1Q==1n)?\'\':c.1Q;4 i=(b==18||b==1n)?8.10(z).1B.1c:b;8.10(z).1B[i]=2b 4A(d,e);5(f!=\'\')8.10(z).1B[i].1Q=f;4 g=M(i);5(g!=-1){4 h=G(8.10(z).1B[i],i,"","");$("#"+g.1a).1z(h)}1d{4 h=G(8.10(z).1B[i],i,"","");4 j=D("1f");$("#"+j).4B(h);K()}};1b.2m=6(i){8.10(z).2m(i);5((M(i))!=-1){$("#"+M(i).1a).2m();3s(i,\'d\')};5(8.10(z).1c==0){T("")}1d{4 a=M(8.10(z).1l).1z;T(a)};s.1v("1l",8.10(z).1l)};1b.1i=6(a,b){8.10(z).1i=a;4 c=D("1O");5(a==11){$("#"+c).19("2o",x.1i);s.20()}1d 5(a==14){$("#"+c).19("2o",1)};5(b!=11){s.1v("1i",a)}};1b.2P=6(){15(8.10(z).2P==18)?1n:8.10(z).2P};1b.2Q=6(){5(29.1c==1){15 8.10(z).2Q(29[0])}1d 5(29.1c==2){15 8.10(z).2Q(29[0],29[1])}1d{3z{3A:"4C 1g 4D 4E!"}}};1b.3C=6(a){15 8.10(z).3C(a)};1b.1r=6(a){5(a==18){15 s.28("1r")}1d{s.1v("1r",a)}};1b.1x=6(a){5(a==18){15 s.28("1x")}1d{s.1v("1x",a)}};1b.4F=6(a,b){s.1K[a]=b};1b.4G=6(a){2s(s.1K[a])(s)};4 3D=6(){s.1v("2R",$.1U.2R);s.1v("2S",$.1U.2S)};4 3E=6(){L();3q();3D();5(q.2t!=\'\'){2s(q.2t)(s)}};3E()};$.1U={2R:2.3,2S:"4H 4I",4J:6(a,b){15 $(a).1U(b).2N("1W")}};$.4K.2U({1U:6(b){15 1b.2H(6(){4 a=2b 2T(1b,b);$(1b).2N(\'1W\',a)})}})})(4L);',62,296,'||||var|if|function||document|selected|||||||||||||||||||||||||||||||||||||||||||||||||||||getElementById|true|attr||false|return|||undefined|css|id|this|length|else|bind|postChildID|index|break|disabled|height|style|selectedIndex|case|null|class|ddTitleText|mouseup|multiple|for|span|div|set|mouseover|size|text|html|position|options|trigger|addClass|bg|showIcon|useSprite|postTitleID|postTitleTextID|mouseout|onActions|unbind|removeClass|ddProp|postID|click|title|sDiv|display|oldIndex|msDropDown|zIndex|dd|keydown|value|preventDefault|close|px|parseInt||padding|background|find||get|arguments|visibleRows|new|keyboardAction|currentKey|postArrowID|focus|dblclick|mousedown|mousemove|option|enabled|top|remove|hide|opacity|stopPropagation|in|scrollTop|eval|onInit|insideWindow|postElementHolder|postAID|postOPTAID|ddTitle|arrow|ddChild|ddOutOfVision|blur|change|keyup|opt|_|each|block|relative|width|after|bi|data|fast|form|item|version|author|bh|extend|rowHeight|mainCSS|Object|postInputhidden|actions||children|className|img|src|align|absmiddle||||href|javascript|void|font|first|bottom|keyCode|visible|open|Math|switch|absolute|hasClass|left|repeat|backgroundPosition|bj|bk|bl|slideUp|none|onkeydown|onkeyup|onOpen|onClose|throw|message|show|namedItem|bm|bn|120|9999|_msddHolder|_msdd|_title|_titletext|_child|_msa|_msopta|postInputID|_msinput|_arrow|_inp|keypress|prop|tabindex|val|nodeName|OPTGROUP|opta|weight||bold|italic|clear|both|label|border|1px|solid|c3c3c3|toggleClass|min|max|refresh|split|mouseenter|0px|overflow|hidden|appendTo|image|no|2px|removeAttr|on|events|100|typeof|delete|slideDown|to|what|default|try|catch|add|Option|append|An|is|required|addMyEvent|fireEvent|Marghoob|Suleman|create|fn|jQuery'.split('|'),0,{}));
/*
 * jQuery Tools 1.2.5 - The missing UI library for the Web
 * 
 * [tooltip, tooltip.slide, tooltip.dynamic]
 * 
 * NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.
 * 
 * http://flowplayer.org/tools/
 * 
 * File generated: Mon Feb 07 12:49:04 GMT 2011
 */
(function(f){function p(a,b,c){var h=c.relative?a.position().top:a.offset().top,d=c.relative?a.position().left:a.offset().left,i=c.position[0];h-=b.outerHeight()-c.offset[0];d+=a.outerWidth()+c.offset[1];if(/iPad/i.test(navigator.userAgent))h-=f(window).scrollTop();var j=b.outerHeight()+a.outerHeight();if(i=="center")h+=j/2;if(i=="bottom")h+=j;i=c.position[1];a=b.outerWidth()+a.outerWidth();if(i=="center")d-=a/2;if(i=="left")d-=a;return{top:h,left:d}}function u(a,b){var c=this,h=a.add(c),d,i=0,j=
0,m=a.attr("title"),q=a.attr("data-tooltip"),r=o[b.effect],l,s=a.is(":input"),v=s&&a.is(":checkbox, :radio, select, :button, :submit"),t=a.attr("type"),k=b.events[t]||b.events[s?v?"widget":"input":"def"];if(!r)throw'Nonexistent effect "'+b.effect+'"';k=k.split(/,\s*/);if(k.length!=2)throw"Tooltip: bad events configuration for "+t;a.bind(k[0],function(e){clearTimeout(i);if(b.predelay)j=setTimeout(function(){c.show(e)},b.predelay);else c.show(e)}).bind(k[1],function(e){clearTimeout(j);if(b.delay)i=
setTimeout(function(){c.hide(e)},b.delay);else c.hide(e)});if(m&&b.cancelDefault){a.removeAttr("title");a.data("title",m)}f.extend(c,{show:function(e){if(!d){if(q)d=f(q);else if(b.tip)d=f(b.tip).eq(0);else if(m)d=f(b.layout).addClass(b.tipClass).appendTo(document.body).hide().append(m);else{d=a.next();d.length||(d=a.parent().next())}if(!d.length)throw"Cannot find tooltip for "+a;}if(c.isShown())return c;d.stop(true,true);var g=p(a,d,b);b.tip&&d.html(a.data("title"));e=e||f.Event();e.type="onBeforeShow";
h.trigger(e,[g]);if(e.isDefaultPrevented())return c;g=p(a,d,b);d.css({position:"absolute",top:g.top,left:g.left});l=true;r[0].call(c,function(){e.type="onShow";l="full";h.trigger(e)});g=b.events.tooltip.split(/,\s*/);if(!d.data("__set")){d.bind(g[0],function(){clearTimeout(i);clearTimeout(j)});g[1]&&!a.is("input:not(:checkbox, :radio), textarea")&&d.bind(g[1],function(n){n.relatedTarget!=a[0]&&a.trigger(k[1].split(" ")[0])});d.data("__set",true)}return c},hide:function(e){if(!d||!c.isShown())return c;
e=e||f.Event();e.type="onBeforeHide";h.trigger(e);if(!e.isDefaultPrevented()){l=false;o[b.effect][1].call(c,function(){e.type="onHide";h.trigger(e)});return c}},isShown:function(e){return e?l=="full":l},getConf:function(){return b},getTip:function(){return d},getTrigger:function(){return a}});f.each("onHide,onBeforeShow,onShow,onBeforeHide".split(","),function(e,g){f.isFunction(b[g])&&f(c).bind(g,b[g]);c[g]=function(n){n&&f(c).bind(g,n);return c}})}f.tools=f.tools||{version:"1.2.5"};f.tools.tooltip=
{conf:{effect:"toggle",fadeOutSpeed:"fast",predelay:0,delay:30,opacity:1,tip:0,position:["top","center"],offset:[0,0],relative:false,cancelDefault:true,events:{def:"mouseenter,mouseleave",input:"focus,blur",widget:"focus mouseenter,blur mouseleave",tooltip:"mouseenter,mouseleave"},layout:"<div/>",tipClass:"tooltip"},addEffect:function(a,b,c){o[a]=[b,c]}};var o={toggle:[function(a){var b=this.getConf(),c=this.getTip();b=b.opacity;b<1&&c.css({opacity:b});c.show();a.call()},function(a){this.getTip().hide();
a.call()}],fade:[function(a){var b=this.getConf();this.getTip().fadeTo(b.fadeInSpeed,b.opacity,a)},function(a){this.getTip().fadeOut(this.getConf().fadeOutSpeed,a)}]};f.fn.tooltip=function(a){var b=this.data("tooltip");if(b)return b;a=f.extend(true,{},f.tools.tooltip.conf,a);if(typeof a.position=="string")a.position=a.position.split(/,?\s/);this.each(function(){b=new u(f(this),a);f(this).data("tooltip",b)});return a.api?b:this}})(jQuery);
(function(d){var i=d.tools.tooltip;d.extend(i.conf,{direction:"up",bounce:false,slideOffset:10,slideInSpeed:200,slideOutSpeed:200,slideFade:!d.browser.msie});var e={up:["-","top"],down:["+","top"],left:["-","left"],right:["+","left"]};i.addEffect("slide",function(g){var a=this.getConf(),f=this.getTip(),b=a.slideFade?{opacity:a.opacity}:{},c=e[a.direction]||e.up;b[c[1]]=c[0]+"="+a.slideOffset;a.slideFade&&f.css({opacity:0});f.show().animate(b,a.slideInSpeed,g)},function(g){var a=this.getConf(),f=a.slideOffset,
b=a.slideFade?{opacity:0}:{},c=e[a.direction]||e.up,h=""+c[0];if(a.bounce)h=h=="+"?"-":"+";b[c[1]]=h+"="+f;this.getTip().animate(b,a.slideOutSpeed,function(){d(this).hide();g.call()})})})(jQuery);
(function(g){function j(a){var c=g(window),d=c.width()+c.scrollLeft(),h=c.height()+c.scrollTop();return[a.offset().top<=c.scrollTop(),d<=a.offset().left+a.width(),h<=a.offset().top+a.height(),c.scrollLeft()>=a.offset().left]}function k(a){for(var c=a.length;c--;)if(a[c])return false;return true}var i=g.tools.tooltip;i.dynamic={conf:{classNames:"top right bottom left"}};g.fn.dynamic=function(a){if(typeof a=="number")a={speed:a};a=g.extend({},i.dynamic.conf,a);var c=a.classNames.split(/\s/),d;this.each(function(){var h=
g(this).tooltip().onBeforeShow(function(e,f){e=this.getTip();var b=this.getConf();d||(d=[b.position[0],b.position[1],b.offset[0],b.offset[1],g.extend({},b)]);g.extend(b,d[4]);b.position=[d[0],d[1]];b.offset=[d[2],d[3]];e.css({visibility:"hidden",position:"absolute",top:f.top,left:f.left}).show();f=j(e);if(!k(f)){if(f[2]){g.extend(b,a.top);b.position[0]="top";e.addClass(c[0])}if(f[3]){g.extend(b,a.right);b.position[1]="right";e.addClass(c[1])}if(f[0]){g.extend(b,a.bottom);b.position[0]="bottom";e.addClass(c[2])}if(f[1]){g.extend(b,
a.left);b.position[1]="left";e.addClass(c[3])}if(f[0]||f[2])b.offset[0]*=-1;if(f[1]||f[3])b.offset[1]*=-1}e.css({visibility:"visible"}).hide()});h.onBeforeShow(function(){var e=this.getConf();this.getTip();setTimeout(function(){e.position=[d[0],d[1]];e.offset=[d[2],d[3]]},0)});h.onHide(function(){var e=this.getTip();e.removeClass(a.classNames)});ret=h});return a.api?ret:this}})(jQuery);
//jQuery Placeholder
(function(){jQuery.fn.extend({placehold:function(){var $query=this;var placeholdOptions=arguments[0]||{};var $inputs=$query.filter(":text, :password");$inputs.each(function(){var $this=jQuery(this);this.placeholdValue=placeholdOptions.placeholdValue||$.trim($this.val());$this.val(this.placeholdValue);$this.addClass(placeholdOptions.blurClass||"");}).bind("focus",function(){var $this=jQuery(this);var val=$.trim($this.val());if(val==this.placeholdValue||val==""){$this.val("").removeClass(placeholdOptions.blurClass||"").addClass(placeholdOptions.focusClass||"");}}).bind("blur",function(){var $this=jQuery(this);var val=$.trim($this.val());if(val==this.placeholdValue||val==""){$this.val(this.placeholdValue).addClass(placeholdOptions.blurClass||"").removeClass(placeholdOptions.focusClass||"");}});return $query;}});})();
/**
 * jQuery.timers - Timer abstractions for jQuery
 * Written by Blair Mitchelmore (blair DOT mitchelmore AT gmail DOT com)
 * Licensed under the WTFPL (http://sam.zoy.org/wtfpl/).
 * Date: 2009/10/16
 *
 * @author Blair Mitchelmore
 * @version 1.2
 *
 **/

jQuery.fn.extend({
	everyTime: function(interval, label, fn, times) {
		return this.each(function() {
			jQuery.timer.add(this, interval, label, fn, times);
		});
	},
	oneTime: function(interval, label, fn) {
		return this.each(function() {
			jQuery.timer.add(this, interval, label, fn, 1);
		});
	},
	stopTime: function(label, fn) {
		return this.each(function() {
			jQuery.timer.remove(this, label, fn);
		});
	}
});

jQuery.extend({
	timer: {
		global: [],
		guid: 1,
		dataKey: "jQuery.timer",
		regex: /^([0-9]+(?:\.[0-9]*)?)\s*(.*s)?$/,
		powers: {
			// Yeah this is major overkill...
			'ms': 1,
			'cs': 10,
			'ds': 100,
			's': 1000,
			'das': 10000,
			'hs': 100000,
			'ks': 1000000
		},
		timeParse: function(value) {
			if (value == undefined || value == null)
				return null;
			var result = this.regex.exec(jQuery.trim(value.toString()));
			if (result[2]) {
				var num = parseFloat(result[1]);
				var mult = this.powers[result[2]] || 1;
				return num * mult;
			} else {
				return value;
			}
		},
		add: function(element, interval, label, fn, times) {
			var counter = 0;
			
			if (jQuery.isFunction(label)) {
				if (!times) 
					times = fn;
				fn = label;
				label = interval;
			}
			
			interval = jQuery.timer.timeParse(interval);

			if (typeof interval != 'number' || isNaN(interval) || interval < 0)
				return;

			if (typeof times != 'number' || isNaN(times) || times < 0) 
				times = 0;
			
			times = times || 0;
			
			var timers = jQuery.data(element, this.dataKey) || jQuery.data(element, this.dataKey, {});
			
			if (!timers[label])
				timers[label] = {};
			
			fn.timerID = fn.timerID || this.guid++;
			
			var handler = function() {
				if ((++counter > times && times !== 0) || fn.call(element, counter) === false)
					jQuery.timer.remove(element, label, fn);
			};
			
			handler.timerID = fn.timerID;
			
			if (!timers[label][fn.timerID])
				timers[label][fn.timerID] = window.setInterval(handler,interval);
			
			this.global.push( element );
			
		},
		remove: function(element, label, fn) {
			var timers = jQuery.data(element, this.dataKey), ret;
			
			if ( timers ) {
				
				if (!label) {
					for ( label in timers )
						this.remove(element, label, fn);
				} else if ( timers[label] ) {
					if ( fn ) {
						if ( fn.timerID ) {
							window.clearInterval(timers[label][fn.timerID]);
							delete timers[label][fn.timerID];
						}
					} else {
						for ( var fn in timers[label] ) {
							window.clearInterval(timers[label][fn]);
							delete timers[label][fn];
						}
					}
					
					for ( ret in timers[label] ) break;
					if ( !ret ) {
						ret = null;
						delete timers[label];
					}
				}
				
				for ( ret in timers ) break;
				if ( !ret ) 
					jQuery.removeData(element, this.dataKey);
			}
		}
	}
});

jQuery(window).bind("unload", function() {
	jQuery.each(jQuery.timer.global, function(index, item) {
		jQuery.timer.remove(item);
	});
});