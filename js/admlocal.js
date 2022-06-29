function TodosItems() {
	var collecion = new Array();
	for (var a in localStorage) {
		var dato = localStorage[a];
		if (typeof dato === 'string') collecion.push(dato);
	}
	return collecion;
}
function Init(p_apikey, p_authDomain, p_databaseURL, p_projectId, p_storageBucket, p_messagingSenderId, p_appId) {
	var firebaseConfig = {
		apiKey: p_apikey,
		authDomain: p_authDomain,
		databaseURL: p_databaseURL,
		projectId: p_projectId,
		storageBucket: p_storageBucket,
		messagingSenderId: p_messagingSenderId,
		appId: p_appId
	};

	// Initialize Firebase
	firebase.initializeApp(firebaseConfig);
}
function EstadoActivo(componentInstance) {
	firebase.auth().onAuthStateChanged(function (user) {
		if (user) {
			componentInstance.invokeMethodAsync('UsuarioAcceso', RetornarUse(user));
		}
	});
}

function ProcesarAcceso(componentInstance, html) {
	Swal.fire({
		title: 'Ingreso de Usuario',
		html: html,
		showLoaderOnConfirm: true,
		showCloseButton: true,
		showCancelButton: true,
		confirmButtonText: 'Ingresar',
		cancelButtonText: 'Registrar',
		preConfirm: async () => {
			var estado = true;

			// verificar ingreso
			var mensaje = "";
			var usuario = document.getElementById('usuario-in').value.trim();
			var password = document.getElementById('password-in').value.trim();
			if (!validarEmail(usuario)) {
				mensaje = 'Ingrese correctamente el e-mail.';
				estado = false;
			}
			if (password.length < 6) {
				mensaje += ' Ingrese una contraseña mayor a 6 dígitos.';
				estado = false;
			}

			// verificar ingreso
			if (!estado) {
				var men = document.getElementById("lblMensaje");
				men.innerHTML = mensaje;
				return false;
			}

			// crear cuenta
			var std = false;
			await firebase.auth().
				signInWithEmailAndPassword(usuario, password)
				.then(function (user) {
					// notificar
					std = true;

					// mostrar notificación ingreso
					Swal.fire({
						position: 'center',
						icon: 'success',
						title: 'Cargando datos de usuario..',
						showConfirmButton: false,
						timer: 1500
					}).then(() => {
						componentInstance.invokeMethodAsync('UsuarioAcceso', RetornarUse(user));
					});
				})
				.catch(function (error) {
					// instanciar
					var men = document.getElementById("lblMensaje");

					// verificar mensaje
					var id = error.code;
					if (id === "auth/user-not-found") {
						men.innerHTML = "Usuario no registrado, por favor Regístrese!!";
					} else if (id === "auth/wrong-password") {
						men.innerHTML = "Contraseña incorrecta!!";
					}
				});
			return std;
		},
		allowOutsideClick: () => Swal.isLoading()
	}).then((result) => {
		if (result.dismiss === 'cancel') {
			componentInstance.invokeMethodAsync('RegistrarAcceso');
		}
	});
}
function ProcesarRegistro(componentInstance, html) {
	Swal.fire({
		title: 'Registrar nuevo Usuario',
		html: html,
		showCloseButton: true,
		cancelButtonText: 'Recuperar',
		showCancelButton: true,
		confirmButtonText: 'Registar',
		showLoaderOnConfirm: true,
		preConfirm: async () => {
			var estado = true;

			// verificar ingreso
			var mensaje = "";
			var usuario = document.getElementById('usuario-in').value.trim();
			var password = document.getElementById('password-in').value.trim();
			if (!validarEmail(usuario)) {
				mensaje = 'Ingrese correctamente el e-mail.';
				estado = false;
			}
			if (password.length < 6) {
				mensaje += ' Ingrese una contraseña mayor a 6 dígitos.';
				estado = false;
			}

			// verificar ingreso
			if (!estado) {
				var men = document.getElementById("lblMensaje");
				men.innerHTML = mensaje;
				return false;
			}

			// registrar  
			var stdo = false;
			await firebase.auth().createUserWithEmailAndPassword(usuario, password)
				.then(function (user) {
					// notificar
					stdo = true;

					// notificar
					Swal.fire({
						position: 'center',
						icon: 'success',
						title: 'Usuario registrado correctamente!!',
						showConfirmButton: false,
						timer: 1500
					}).then(() => {
						componentInstance.invokeMethodAsync('UsuarioAcceso', RetornarUse(user));
					});
				})
				.catch(function (error) {
					// instanciar
					var men = document.getElementById("lblMensaje");

					// obtener mensaje
					var errorCode = error.code;
					if (errorCode == 'auth/weak-password') {
						men.innerHTML = 'La contraseña es muy débil.';
					} else if (errorCode == 'auth/email-already-in-use') {
						men.innerHTML = "Este Usuario ya existe, intenta recuperar con tu e-mail ingresado!!";
					} else if (errorCode == 'auth/wrong-password') {
						men.innerHTML = 'La contraseña no es válida';
					} else {
						men.innerHTML = "Usuario y/o contraseña incorrectos";
					}
				});
			return stdo;
		},
		allowOutsideClick: () => Swal.isLoading()
	}).then((result) => {
		if (result.dismiss === 'cancel') {
			componentInstance.invokeMethodAsync('RecuperarAcceso');
		}
	});
}
function RetornarUse(user) {
	const use = {
		Id: user.uid,
		FirstName: 'ND',
		LastName: 'ND',
		Username: AnalizarVacios(user.displayName, "ND"),
		Token: user.uid,
		PhotoUrl: AnalizarVacios(user.photoURL, ""),
		PhoneNumber: AnalizarVacios(user.phoneNumber, "0"),
		IsDeleting: false,
		IsEmailVerified: user.emailVerified
	};
	return use;
}
function AnalizarVacios(valor, defecto) {
	if (valor == null || valor == undefined || valor == 0) return defecto
	else return valor;
}
function validarEmail(valor) {
	if (/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(valor)) {
		return true;
	} else {
		return false;
	}
}
function FinalizarAcceso(componentInstance) {
	swal.fire({
		title: '¿Estás seguro?',
		text: "La sesión actual se cerrará",
		showCancelButton: true,
		confirmButtonColor: '#F44336',
		cancelButtonColor: '#03A9F4',
		confirmButtonText: '<i class="zmdi zmdi-run"></i> ¡Sí, salir!',
		cancelButtonText: '<i class="zmdi zmdi-close-circle"></i> ¡No, cancelar!'
	}).then(function (result) {
		if (result.value) {
			firebase.auth().signOut();
			componentInstance.invokeMethodAsync('ProcesoConfirmado',0);
		}
	});
}
function StorageUse(componentInstance,id, bytes) {
	// registrar imagen
	var storageRef = firebase.storage().ref();
	var thisRef = storageRef.child(id);
	thisRef.put(bytes).then(function (snapshot) {
		console.log("storage", snapshot);
		componentInstance.invokeMethodAsync('StorageConfirmado', "");
	});
}
function UseRegistro(user) {
	var user = firebase.auth().currentUser;
	user.updateProfile({ displayName: user.Username, photoURL: user.PhotoUrl, phoneNumber: user.PhoneNumber })
		.then(function () { }).catch(function (error) {
			console.log("userregistro", error)
		});
}

async function ItemServer(path) {
	var dbref = firebase.database();
	var referencia = dbref.ref(path)

	var obj = {};
	await referencia.once('value', snapshot => {
		snapshot.forEach(snap => {
			obj[snap.key] = snap.val()
		});
	});
	
	return obj;
}
async function ObtenerServer(path) {
	var dbref = firebase.database();
	var referencia = dbref.ref(path)

	var colleccion = [];
	await referencia.once('value', snapshot => {
		snapshot.forEach(snap => {
			colleccion.push(snap.val());
		});
	});

	return colleccion;
}
function ProcesarServer(path, object) {
	var dbref = firebase.database();
	var referencia = dbref.ref(path);
	referencia.set(object);
}
function EliminarServer(path) {
	var dbref = firebase.database();
	var referencia = dbref.ref(path)
	referencia.remove();
}

let ultimoDocumento = null;
async function ObtenerItemsServer(path, seccion, where01, where02, orderby01, orderby02, inclemento, ultimoRegistro) {
	// acceso
	var dbref = firebase.firestore();
	if (!ultimoRegistro) ultimoDocumento = null;

	// procesar
	var art;
	if (ultimoDocumento != null) {
		art = dbref.collection(path).
			where(where01, 'not-in', ['', ' ']).
			where(where02, "==", seccion).
			orderBy(orderby01, 'desc').
			orderBy(orderby02, 'asc').
			startAfter(ultimoDocumento).
			limit(inclemento);
	}
	else {
		art = dbref.collection(path).
			where(where01, 'not-in', ['', ' ']).
			where(where02, "==", seccion).
			orderBy(orderby01, 'desc').
			orderBy(orderby02, 'asc').
			limit(inclemento);
	}

	// procesar petición
	var colleccion = new Array();
	var resultado = await art.get();
	for (const doc of resultado.docs) {
		ultimoDocumento = doc;
		colleccion.push(ultimoDocumento.data());
	}

	// datos 
	return colleccion;
}
async function FiltroItemsServer(path, campo, texto) {
	// acceso
	var dbref = firebase.firestore();

	// consulta
	var art = dbref.collection(path)
		.where(campo, ">=", texto)
		.where(campo, "<=", texto + "~")
		.orderBy(campo)
		.limit(50);

	// procesar petición
	var colleccion = new Array();
	var resultado = await art.get()
	for (const doc of resultado.docs) {
		colleccion.push(doc.data());
	}
	return colleccion;
}
function ProcesarItemServer(path, object) {
	var dbref = firebase.firestore();
	var art = dbref.collection(path)
	art.add(object);
}

function MensajeGestion(url, key, token, descri, observ) {
	$.ajax({
		type: 'POST',
		url: url,
		headers: {
			Authorization: 'key=' + key
		},
		contentType: 'application/json',
		dataType: 'json',
		data: JSON.stringify({
			"to": token,
			"notification": { "title": descri, "body": observ },
			"priority": "high"
		}),
		success: function (response) {
			console.log("success-Mensaje", response);
		},
		error: function (xhr, status, error) {
			console.log("Error-Mensaje", xhr.error);
		}
	});
}
function MensajeConfirmacion(componentInstance, p_titulo, p_mensaje, p_aceptar, p_cancelar) {
	Swal.fire({
		title: p_titulo,
		text: p_mensaje,
		icon: 'question',
		showCancelButton: true,
		confirmButtonColor: '#3085d6',
		cancelButtonColor: '#d33',
		confirmButtonText: p_aceptar,
		cancelButtonText: p_cancelar
	}).then((result) => {
		if (result.isConfirmed) componentInstance.invokeMethodAsync('ProcesoConfirmado',1);
	})
}
function Mensaje(p_titulo, p_mensaje, p_posicion, p_icon) {
	Swal.fire({
		title: p_titulo,
		text: p_mensaje,
		position: p_posicion,
		icon: p_icon,
		showConfirmButton: false,
		timer: 1500
	});
}