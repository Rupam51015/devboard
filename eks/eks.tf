module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 21.0"

  name               = "devboard-cluster"
  kubernetes_version = "1.36"

  addons = {
    coredns                 = {
      most_recent    = true
    }
    eks-pod-identity-agent  = {
      most_recent    = true
      before_compute = true
    }
    kube-proxy              = {
      most_recent    = true
    }
    vpc-cni                 = {
      most_recent    = true
      before_compute = true
    }
    aws-ebs-cis-driver      = {
      attach_ebs_csi_policy = true
      most_recent    = true
    }
    matrics_server          = {
        most_recent  = true
    }
  }

  # Optional
  endpoint_public_access  = true
  endpoint_private_access = true
  # Optional: Adds the current caller identity as an administrator via cluster access entry
  enable_cluster_creator_admin_permissions = true

  vpc_id                   = module.vpc.vpc_id
  subnet_ids               = module.vpc.private_subnets
  control_plane_subnet_ids = module.vpc.intra_subnets

  # EKS Managed Node Group(s)
  eks_managed_node_groups = {
    devboard_node_group = {
      instance_types = ["t3.medium"]
      capacity_type  = "SPOT"
      min_size       = 2
      max_size       = 3
      desired_size   = 2
    }
  }

  tags = {
    Project = "devboard"
  }
}
