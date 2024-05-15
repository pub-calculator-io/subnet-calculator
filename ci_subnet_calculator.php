<?php
/*
Plugin Name: CI Subnet calculator
Plugin URI: https://www.calculator.io/subnet-calculator/
Description: This IP subnet calculator makes subnetting easy, providing full subnet information like IP ranges, subnet masks and more from just basic network information.
Version: 1.0.0
Author: Subnet Calculator / www.calculator.io
Author URI: https://www.calculator.io/
License: GPLv2 or later
Text Domain: ci_subnet_calculator
*/

if (!defined('ABSPATH')) exit;

if (!function_exists('add_shortcode')) return "No direct call for Subnet Calculator by www.calculator.io";

function display_calcio_ci_subnet_calculator(){
    $page = 'index.html';
    return '<h2><img src="' . esc_url(plugins_url('assets/images/icon-48.png', __FILE__ )) . '" width="48" height="48">Subnet Calculator</h2><div><iframe style="background:transparent; overflow: scroll" src="' . esc_url(plugins_url($page, __FILE__ )) . '" width="100%" frameBorder="0" allowtransparency="true" onload="this.style.height = this.contentWindow.document.documentElement.scrollHeight + \'px\';" id="ci_subnet_calculator_iframe"></iframe></div>';
}


add_shortcode( 'ci_subnet_calculator', 'display_calcio_ci_subnet_calculator' );