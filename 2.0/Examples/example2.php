<?php
$connection = new mysqli('localhost', 'root', 'phpdeveloper', 'bd_prueba');

if ($connection->connect_error) exit ('Could not connect to the server');

$term = $connection->real_escape_string(strip_tags(trim($_GET['term'])));
$query = "SELECT * FROM ciudades WHERE nombre_ciudad LIKE '%{$term}%'";
$result = $connection->query($query) or exit ('Could not execute the query');
$response = [];

if ($result->num_rows){
	while ($row = $result->fetch_array()){
		$response[] = $row['nombre_ciudad'];
	}
	$result->free();
}

$connection->close();
echo json_encode($response);
?>
