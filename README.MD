




Instruction: 


1. include the css and js script to your page : 

	<link rel="stylesheet" href="<?php echo base_url()?>image/js/simplePaginationAjax/simplePaginationAjax.css" type="text/css" />
	<script type="text/javascript" src="<?php echo base_url()?>image/js/simplePaginationAjax/jquery.simplePaginationAjax.js"></script> 

2. type your pagination div : 

	 <div class="pagination"></div>

3. define it with the class : 

	var pagination_class = $('.pagination');

	//im using codeigniter here, you freely use others php style or library
	var targetUrl = "<?php echo site_url().'/pengunjung/get_page/';?>";


 	//pagination
    $(function() {
        pagination_class.pagination({
            items: <?php echo $total_row;?>,
            itemsOnPage: <?php echo $per_page;?>,
            cssStyle: "dark-theme",
            targetUrl: targetUrl,
                      
        });
    });


 As you can see there at least 2 php variabel on it, $total_row and $per_page
 $total_row is retrieved by calculating total row of your record
 $per_page is retreieved from your plan to show how many record should be showed

 example : 

 //myphpfile.php
 $this->data['per_page']    = 10;
 $this->data['total_row'] = $this->M_pengunjung->get_count_all() ;


 4. create php file for database ajax request 

    //example (using codeigniter)
    //location page : <?php echo site_url().'/pengunjung/get_page';?>;
    //
        function get_page()
        {
                
                $page_number = $this->input->post('page_number');
                $current_page = $this->input->post('current_page');
                $page_class = $this->input->post('page_class');
                $per_page = $this->input->post('per_page');
            




            
                $count_row= @$this->M_pengunjung->count_pengunjung('anggota')->num_rows();
                
                
                if($count_row)
                {
                    $count_row= @$this->M_pengunjung->count_pengunjung('anggota')->num_rows();
                    $this->data['list']  = $this->M_pengunjung->get_page('anggota', $page_number, $per_page);
                    $this->data['page_number'] = $current_page;
                    

                    
                    $this->data['total_row'] = $count_row;

                    $this->data;

                    if($this->data['list'] != FALSE)
                    {
                        $this->load->view('V_pagination', $this->data);
                        
                    }
                }
                
                
                        
                
                
        }

        //SQL Query Example
        //from $this->data['list'] variabel 

        'SELECT * FROM table_name LIMIT $page_number, $per_page';


5. to send custom data add to options
    
    data: {array_name1: array_value1, array_name2 : array_value2}

    //to get this 
    //on php file

    $data = $_POST['user_data']
    echo $data['array_name1'];


6. View file

//example view file
//from targetUrl that has been defined

    <div id="page<?php echo $page_number;?>">


    <table class="table table-bordered"> 
      <tr>
        <th> No </th>
        <th> Nama </th>
        <th> Tujuan </th>
        <th> Tanggal </th>
      </tr>
    <?php 
      $no = 1;
      
    foreach ($list->result() as $row): ?>
    <tr>
        <td> <?php echo $no;?> </td>
        <td> <?php echo $row->nama;?> </td>
        <td> <?php echo $row->tujuan_id; ?> </td>
        <td> <?php echo $row->time_log; ?> </td>
    </tr>

    <?php 
      $no++;
    endforeach; //end foreach ?>

    </table>
    </div>