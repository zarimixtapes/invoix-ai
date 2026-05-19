export type Customer={id:string;name:string;phone:string;email:string;address:string};
export type Item={id:string;description:string;quantity:number;unitPrice:number};
export type Template={id:string;name:string;accent:string;logoText:string;notes:string};
export type Invoice={id:string;number:string;customer:Customer;issueDate:string;dueDate:string;status:string;currency:string;language:string;templateId:string;items:Item[];notes:string};
