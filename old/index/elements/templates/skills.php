<?php
	$names = strArray($row['skills']);
	$percentages = strArray($row['percentages']); // Gets the percentages in array form
	$average = round(array_sum($percentages) / count($percentages)); // Calculates average percentage
?>
<div class="card">
	<div class="text">
		<div class="head">
			<div class="tag">
				<h3><?= $row['title']; ?></h3>
			</div>
			<div class="box" ><progress max="100" value="<?= $average; ?>"></progress></div>
		</div>
		<div class="collapse">
			<hr/>
			<div class="box">
				<div class="description">
					<p><?= $row['description']; ?></p>
				</div>
				<div class="progress">
					<div class="container">
						<div>
							<p><?= trim($names[0], "''"); ?></p>
							<progress max="100" value="<?= $percentages[0]; ?>"></progress>
						</div>
						<div>
							<p><?= trim($names[1], "''"); ?></p>
							<progress max="100" value="<?= $percentages[1]; ?>"></progress>
						</div>
						<div>
							<p><?= trim($names[2], "''"); ?></p>
							<progress max="100" value="<?= $percentages[2]; ?>"></progress>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
