<?php
	if ($row["date_end"] == null)
	{
		$row["date_end"] = "now";
	}
?>

<div class="card">
	<div class="text">
		<div class="head">
			<div class="tag">
				<h3><?= $row['title']; ?></h3>
				<p><?= $row['place']; ?></p>
			</div>
			<div class="box">
				<div class="date">
						<span class="begin" date="<?= $row["date_start"]; // Text via Javascript ?>"></span>
						<span>-</span>
						<span class="end" date="<?= $row["date_end"]; // Text via Javascript ?>"></span>
						<div class="tooltip"></div>
				</div>
			</div>
		</div>
		<div class="collapse">
			<hr/>
			<p><?= $row['description']; ?></p>
			<br/>
			<?php
				$types = strArray($row['data_type']);
				$data = strArray($row['data_text']);

				for ($i = 0; $i < count($types); $i++)
				{
					if ($types[$i] == "link")
					{
						echo '<a rel="external" target="_blank" href="' . $data[$i] . '">Website</a>'; // Link with href and text
					}
					else if ($types[$i]== "number")
					{
						echo '<p class="number">' . $data[$i] . '</p>'; // Link with href and text
					}
				}
			?>
		</div>
	</div>
</div>
